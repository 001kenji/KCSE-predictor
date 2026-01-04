"""
KCSE Question Prediction Task Guide
This file outlines the complete workflow for processing KCSE past papers and generating predictions.
"""
from django.core.files import File
import os,io,fitz
import pdfplumber
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
from django.db import transaction
from .models import Subject, PastQuestion, Prediction, TrainedModel, PaperTopicSet
import logging,shutil
from django.conf import settings
from django.utils import timezone
import pytesseract
from PIL import Image, ImageEnhance
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from collections import defaultdict, Counter
from sklearn.multiclass import OneVsRestClassifier
from .TOPIC_KEYWORDS import TOPIC_KEYWORDS as topic_keyword_object
logger = logging.getLogger(__name__)

class KCSEQuestionProcessor:
    """
    Main class handling the complete workflow from PDF extraction to prediction generation.
    """

    CONFIG = {
    'tesseract_path': None,  # Set if needed: r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    'ocr_config': '--psm 6 --oem 3',  # PSM 6: Assume uniform block of text, OEM 3: Default engine
    'preprocess': True,  # Enable image preprocessing
    'dpi': 300,  # Default DPI for images without resolution info
    }

    TOPIC_KEYWORDS = topic_keyword_object
  
    QUESTION_START = re.compile(
        r'''
        (?P<anchor>                 # where a question can begin
            (?<!\d)                 # not preceded by a digit
            (?:QUESTION\s*)?        # optional 'QUESTION'
            (?P<num>\d{1,2})        # 1–2 digit question number
            \s*                     # optional spaces
            (?:[.)\]:-])?           # optional punctuation after number
            \s+                     # at least one space before text
            (?=[A-Za-z(])           # next char looks like start of a sentence (letter or '(')
        )
        ''',
        re.IGNORECASE | re.VERBOSE
    )



    def __init__(self):
        self.pdf_folder = 'data/past_papers'
        self.model_folder = 'media/ai_models'
        if self.CONFIG['tesseract_path']:
            pytesseract.pytesseract.tesseract_cmd = self.CONFIG['tesseract_path']

    def get_paper_type(self, filename):
        match = re.search(r'_P(\d)\.pdf$', filename)
        if match:
            return f"Paper {match.group(1)}"
        return "Unknown"
        
    def process_all_pdfs(self, subject_ids=None):
        """
        Process all PDFs or a filtered list based on subject_ids.
        """
        print('# Step 1: Get and process PDFs')
        pdf_files = self._get_pdf_files(subject_ids)

        paper_topics = defaultdict(list)
       
        for pdf_file in pdf_files:
            # print(pdf_file)
            subject_code, _, _ = self._parse_filename(pdf_file)
            subject_obj = Subject.objects.filter(code=subject_code.upper()).first()
            if not subject_obj:
                continue
            if subject_ids and subject_obj.id not in subject_ids:
                continue

            print(f"Processing file: {pdf_file}", flush=True)
            exam_paper = self.get_paper_type(pdf_file)
            paper_key, topics = self.process_single_pdf(pdf_file, exam_paper)
            if topics:
                paper_topics[paper_key].extend(topics)

        # Flatten and save
        flattened_topic_occurrences = []
        for (subject, year, paper), topic_dicts in paper_topics.items():
            for topic_info in topic_dicts:
                flattened_topic_occurrences.append((subject, topic_info['topic'], year, topic_info['paper']))

        print('Saving to database')
        self._save_to_database(flattened_topic_occurrences)

        return {'success': True, 'result': f"Processed {len(paper_topics)} papers"}


    def _get_pdf_files(self, subject_ids=None):
        """
        Get list of all PDF files inside folders named after subject codes.
        If subject_ids is provided, only check folders for those subjects.
        """
        pdf_files = []

        # Map subject_ids to their codes
        print(subject_ids)
        if subject_ids:
            subject_codes = set(
                Subject.objects.filter(id__in=subject_ids).values_list('code', flat=True)
            )
            print('..')
        else:
            # No filter: load all subject folders
            subject_codes = set(os.listdir(self.pdf_folder))
            print('...')
        print(subject_codes)
        for code in subject_codes:
            subject_folder = os.path.join(self.pdf_folder, code.upper())
            if not os.path.isdir(subject_folder):
                print('not found',subject_folder)
                continue
            for file in os.listdir(subject_folder):
                if file.endswith('.pdf'):
                    full_path = os.path.join(code.upper(), file)  # store relative path
                    print(full_path)
                    pdf_files.append(full_path)

        return pdf_files


    def process_single_pdf(self, pdf_file, exam_paper):
        pdf_path = os.path.join(self.pdf_folder, pdf_file)
        # print('pdf path:',pdf_path)
        subject_code, year, paper_num = self._parse_filename(pdf_file)
        subject = Subject.objects.get(code=subject_code.upper())

        with pdfplumber.open(pdf_path) as pdf:
            text = self._extract_pdf_text(pdf, pdf_path, exam_paper)
            topics = self.extract_topics_from_text(text, subject, year, paper_num)

        return ((subject, year, paper_num), topics)

    def _normalize_text(self, text: str) -> str:
        # unify newlines
        t = text.replace('\r\n', '\n').replace('\r', '\n')

        # kill common headers/footers and page codes
        t = re.sub(r'Kenya Certificate of Secondary Education.*?\n', '', t, flags=re.I)
        t = re.sub(r'Turn over.*?\n', '', t, flags=re.I)
        t = re.sub(r'\n?\s*\d{6,}-\d+-\d+.*?\n', '\n', t)  # e.g. 002363700-2-11/34

        # normalize a few common OCR punctuation glitches
        trans = str.maketrans({
            '—':'-', '–':'-', '—':'-', '·':'.', '•':'.', '“':'"', '”':'"', '’':"'", '‘':"'",
            '€':'e', '§':'S', '¢':'c', '©':'(c)', '·':'.'
        })
        t = t.translate(trans)

        # collapse excessive whitespace
        t = re.sub(r'[ \t]+', ' ', t)
        t = re.sub(r'\n[ \t]+', '\n', t)

        return t
    
    
    def extract_topics_from_text(self, text, subject, year, paper_num):
        """
        Extract set of unique topics from the paper text.
        Handles multiple question numbering formats:
        - 1. Question text...
        - 1) Question text...
        - (a) Question text...
        - a) Question text...
        - 1 Question text... (standalone number)
        """
        topics = []
        question_number = 0
        
        text = self._normalize_text(text=text)
        question_blocks = re.split(
            r'\n\s*(?=\d+(?:[\.\)]|$)|\(?[a-z]\)|QUESTION\s*\d+)', 
            text, 
            flags=re.IGNORECASE
        )

        
        # If we didn't get good splits, try more aggressive pattern
        if len(question_blocks) < 8:
            question_blocks = re.split(r'\n\s*(?=\d+\D)', text)
        
        for block in question_blocks:
            if not block.strip():
                continue
            
            # Extract the clean question text
            question_text = re.sub(
                r'^\s*\d+[\.\)]?\s*|\s*\[?\(?\d+\s*(marks|mks?)\)?\]?', 
                '', 
                block, 
                flags=re.IGNORECASE
            ).strip()
            
            if not question_text:
                continue
                
            question_lower = question_text.lower()
            subject_key = subject.code.upper()

            if subject_key not in self.TOPIC_KEYWORDS:
                continue

            # Track if we found any topic for this question
            found_topics = False
            
            for topic_name, keywords in self.TOPIC_KEYWORDS[subject_key].items():
                for keyword in keywords:
                    if re.search(r'\b' + re.escape(keyword) + r'\b', question_lower):
                        topics.append({
                            'topic': topic_name.capitalize(),
                            'paper': paper_num,
                            'question_text': question_text[:100]  # Store snippet for debugging
                        })
                        found_topics = True
            
            if found_topics:
                question_number += 1

        # print(f'Extracted {question_number} questions with {len(topics)} topic matches for {subject_key} {year} Paper {paper_num}')
        print('quiz: ',question_number,' topics: ',len(topics))
        
        return topics


    def _parse_filename(self, filename):
        """
        Extract subject code, year and paper number from filename
        Format: SUBJECTCODE_YEAR_PAPERNUM.pdf (e.g. MATH_2020_P1.pdf)
        """
        
        suject_path = filename.split('\\')
        # print('called',suject_path)
        parts = suject_path[1].split('_')
        subject_code = parts[0]
        year = int(parts[1])
        paper_num = int(parts[2].split('.')[0][1:])  # Extract number from P1, P2, etc.
        return subject_code, year, paper_num

    def _extract_pdf_text(self,pdf, pdf_path,exam_paper):
        """Extract and clean text from PDF, fallback to OCR if text is too short"""
        full_text = []
        i = 1
        for page in pdf.pages:
            text = page.extract_text()
            # print(f"Page {i} length:", len(text))
            if text:
                # Clean up text (remove headers/footers, etc.)
                text = re.sub(r'Page \d+ of \d+', '', text)
                text = re.sub(r'KCSE \d+', '', text)
                full_text.append(text.strip())

            # i = i + 1

        combined_text = '\n'.join(full_text).strip()

        return combined_text


    @transaction.atomic
    def _save_to_database(self, topic_occurrences):
        """
        Save grouped topics per paper/year/subject into PaperTopicSet.
        topic_occurrences: list of (subject, topic, year, paper_number)
        """
        grouped = defaultdict(list)
        for subject, topic, year, paper in topic_occurrences:
            grouped[(subject.id, year, paper)].append(topic)

        for (subject_id, year, paper), topics in grouped.items():
            subject = Subject.objects.get(id=subject_id)
            PaperTopicSet.objects.update_or_create(
                subject=subject,
                year=year,
                paper_number=paper,
                defaults={"topics": topics}
            )

    def train_prediction_model(self):
        """
        Train a multi-label AI model to predict a set of topics per paper.
        Input: Subject + Year + Paper number
        Output: Multi-label topic predictions
        """
        # Get data
        data = PaperTopicSet.objects.all().values_list(
            'subject__name', 'year', 'paper_number', 'topics'
        )
        if not data:
            raise ValueError("No paper-topic data found. Process PDFs first.")

        df = pd.DataFrame(data, columns=['subject', 'year', 'paper', 'topics'])
        df['features'] = df['subject'] + " Year" + df['year'].astype(str) + " Paper" + df['paper'].astype(str)

        # Vectorize labels
        mlb = MultiLabelBinarizer()
        y = mlb.fit_transform(df['topics'])
        X = df['features']

        # Define pipeline
        
        # print('Define pipeline')
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
            ('clf', OneVsRestClassifier(LogisticRegression(max_iter=1000, class_weight='balanced'), n_jobs=-1))
        ])
        pipeline.fit(X, y)
        # print('Save model – remove old models first')
        # Save model – remove old models first
        os.makedirs(self.model_folder, exist_ok=True)

        # print(00)
        for f in os.listdir(self.model_folder):
            file_path = os.path.join(self.model_folder, f)
            # print('file:', f)

            if os.path.isfile(file_path):
                os.remove(file_path)

        # print('1')
        model_path = os.path.join(self.model_folder, 'topic_multilabel_model.pkl')
        vectorizer_path = os.path.join(self.model_folder, 'topic_multilabel_vectorizer.pkl')
        label_binarizer_path = os.path.join(self.model_folder, 'label_binarizer.pkl')
        # print('2')
        joblib.dump(pipeline, model_path)
        joblib.dump(pipeline.named_steps['tfidf'], vectorizer_path)
        joblib.dump(mlb, label_binarizer_path)

        # Feedback Loop (Optional): Save prediction stats / retrain schedule
        self._record_feedback_stats(model_path, X, y)
        # print(' Clean DB')
        # Clean DB
        TrainedModel.objects.all().delete()
        with open(model_path, 'rb') as mf, open(vectorizer_path, 'rb') as vf:
            TrainedModel.objects.create(
                model_file=File(mf, name='topic_multilabel_model.pkl'),
                vectorizer_file=File(vf, name='topic_multilabel_vectorizer.pkl'),
                accuracy=1.0,  # Training only
                is_active=True,
            )

        return {
            'success': True,
            'result': "Multi-label topic prediction model trained and saved.",
            'model_path': model_path
        }

    
    def _record_feedback_stats(self, model_path, X_train, y_train):
        """
        Optional: Track metadata for future feedback loop.
        """
        print('getting path')
        feedback_dir = os.path.normpath(os.path.join(self.model_folder, "feedback_logs"))
        print("Creating feedback_dir:", feedback_dir)
        os.makedirs(feedback_dir, exist_ok=True)
        pd.DataFrame({'input': X_train, 'labels': list(y_train)}).to_csv(
            os.path.join(feedback_dir, "training_log.csv"), index=False
        )


    def make_subject_predictions(self, subject_ids=None):
        try:
            active_model = TrainedModel.objects.filter(is_active=True).first()
            if not active_model:
                return {
                    'success': False,
                    'error': "No active model found. Train a model first."
                }

            pipeline = joblib.load(active_model.model_file.path)
            label_binarizer = joblib.load(os.path.normpath(os.path.join(settings.BASE_DIR, self.model_folder, 'label_binarizer.pkl')))

            vectorizer = joblib.load(active_model.vectorizer_file.path)

            if subject_ids is None:
                subject_ids = Subject.objects.values_list('id', flat=True)

            predictions = []
            error_count = 0

            for subject_id in subject_ids:
                try:
                    subject = Subject.objects.get(id=subject_id)
                    prediction_result = self._predict_for_subject(subject, pipeline, vectorizer, label_binarizer)

                    if prediction_result and prediction_result.get('success', False):
                        predictions.append(prediction_result['prediction'])
                    else:
                        error_count += 1

                except Exception as e:
                    logger.error(f"Failed to predict for subject {subject_id}: {str(e)}")
                    error_count += 1
                    continue

            return {
                'success': True,
                'result': 'Predictions made successfully',
                'predictions': predictions,
                'total_subjects': len(subject_ids),
                'successful_predictions': len(predictions),
                'failed_predictions': error_count
            }

        except Exception as e:
            logger.error(f"Prediction process failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


    def _predict_for_subject(self, subject, pipeline, vectorizer, label_binarizer):
        """
        Generate topic predictions for a single subject.
        Returns dictionary with success status and prediction.
        """
        try:
            papers = PaperTopicSet.objects.filter(subject=subject)
            if not papers.exists():
                return {
                    'success': False,
                    'error': f"No papers found for subject {subject.name}"
                }
            # Count how many times each topic appears
            topic_counter = Counter()
            for paper in papers:
                if paper.topics:
                    topic_counter.update(paper.topics)
          
            print('Predicting for subject:', subject.name)

            # Extract all topics from all papers, flatten the lists
            topics = []
            for paper in papers:
                if paper.topics:
                    topics.extend(paper.topics)

            if not topics:
                return {
                    'success': False,
                    'error': f"No topics found for subject {subject.name}"
                }

            # Input feature text (subject name + all topics)
            features_text = f"{subject.name} {' '.join(topics)}"

            # Vectorize
            X_input = pipeline.named_steps['tfidf'].transform([features_text])

            # Predict probabilities
            proba = pipeline.named_steps['clf'].predict_proba(X_input)[0]

            # Map to topic names via label_binarizer
            # Calculate average number of topics per paper for this subject
            topic_counts = [len(paper.topics) for paper in papers if paper.topics]
            avg_topic_count = round(sum(topic_counts) / len(topic_counts)) if topic_counts else 10

            MIN_TOPIC_OCCURRENCE = 10
            # Count most frequent paper number per topic

            topic_to_paper_map = defaultdict(list)
            for paper in papers:
                for t in paper.topics:
                    topic_to_paper_map[t].append(paper.paper_number)

            # Determine dominant paper number for each topic
            dominant_paper_per_topic = {
                topic: Counter(papers).most_common(1)[0][0]
                for topic, papers in topic_to_paper_map.items()
            }

            predicted_topics = [
                {
                    'topic': label_binarizer.classes_[i],
                    'confidence': round(float(p), 5),
                    'occurrences': topic_counter.get(label_binarizer.classes_[i], 0),
                    'paper': dominant_paper_per_topic.get(label_binarizer.classes_[i], None)
                }
                for i, p in enumerate(proba)
                if p > 0.05 and topic_counter.get(label_binarizer.classes_[i], 0) >= MIN_TOPIC_OCCURRENCE
            ]


            predicted_topics.sort(key=lambda x: x['confidence'], reverse=True)

            # predicted_topics = predicted_topics[:10]
            predicted_topics = predicted_topics[:avg_topic_count]

            avg_confidence = round(
                sum(t['confidence'] for t in predicted_topics) / len(predicted_topics),
                5
            ) if predicted_topics else 0.0

            # Save to DB
            prediction = Prediction.objects.update_or_create(
                subject=subject,
                defaults={
                    'predicted_topics': predicted_topics,
                    'confidence': avg_confidence,
                    'updated_at': timezone.now(),  # explicitly set the time
                }
            )

            return {
                'success': True,
                'prediction': prediction,
                'confidence': avg_confidence
            }

        except Exception as e:
            logger.error(f"Prediction failed for {subject.name}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
