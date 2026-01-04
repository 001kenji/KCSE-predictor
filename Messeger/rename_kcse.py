import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
directory = os.path.join(base_dir, "data", "past_papers",'CHEM')

# Improved regex to handle various patterns
filename_pattern = re.compile(
    r"(?P<year>20\d{2}|200\d).*?(?:PAPER|P)[\s\-]?0?(?P<paper>\d)", re.IGNORECASE
)

# Optional: Check the directory contents
# print("Found files in:", directory)
# print(os.listdir(directory))

for filename in os.listdir(directory):
    # print("Processing:", filename)
    if filename.lower().endswith(".pdf"):
        match = filename_pattern.search(filename)
        if match:
            year = match.group("year")
            paper_number = match.group("paper")
            new_name = f"CHEM_{year}_P{paper_number}.pdf"
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)
            print(f"Renaming: {filename} → {new_name}")
            os.rename(old_path, new_path)
        else:
            print(f"❌ Skipped (no match): {filename}")
