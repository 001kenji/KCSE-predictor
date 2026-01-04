import os
import io
import fitz  # PyMuPDF
import pytesseract
from PIL import Image, ImageEnhance

# Configure these settings for better OCR results
CONFIG = {
    'tesseract_path': None,  # Set if needed: r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    'ocr_config': '--psm 6 --oem 3',  # PSM 6: Assume uniform block of text, OEM 3: Default engine
    'preprocess': True,  # Enable image preprocessing
    'dpi': 300,  # Default DPI for images without resolution info
}


def preprocess_image(image):
    """Enhance image for better OCR results"""
    # Convert to grayscale
    image = image.convert('L')
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(2.0)
    
    return image

def extract_text_from_pdf_images(pdf_path):
    extracted_text = []
    
    # Set tesseract path if specified
    if CONFIG['tesseract_path']:
        pytesseract.pytesseract.tesseract_cmd = CONFIG['tesseract_path']

    # Open the PDF
    doc = fitz.open(pdf_path)

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        image_list = page.get_images(full=True)

        if not image_list:
            print(f"[Page {page_num + 1}] No images found.")
            continue

        page_text = []
        for img_index, img in enumerate(image_list):
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                # Convert to PIL Image
                pil_image = Image.open(io.BytesIO(image_bytes))
                
                # Set DPI if not present
                if pil_image.info.get('dpi') == (1, 1):
                    pil_image.info['dpi'] = (CONFIG['dpi'], CONFIG['dpi'])
                
                # Preprocess image if enabled
                if CONFIG['preprocess']:
                    pil_image = preprocess_image(pil_image)

                # OCR to extract text with custom configuration
                text = pytesseract.image_to_string(
                    pil_image,
                    config=CONFIG['ocr_config']
                )
                
                page_text.append(f"\n[Image {img_index + 1}]\n{text.strip()}")
                
            except Exception as e:
                print(f"Error processing page {page_num + 1}, image {img_index + 1}: {str(e)}")
                continue

        if page_text:
            extracted_text.append(f"\n\n=== Page {page_num + 1} ===" + ''.join(page_text))

    doc.close()
    return '\n'.join(extracted_text).strip()




# Usage example
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "data", "past_papers", "MATH_2000_P1.pdf")

# text_output = extract_text_from_pdf_images(file_path)
# print(text_output)

