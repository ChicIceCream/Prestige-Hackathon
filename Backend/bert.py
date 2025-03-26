from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine

# Load a pre-trained BERT-based model for sentence embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")  # Efficient and accurate model

def get_similarity(text1, text2):
    """Compute the similarity score between two texts using BERT embeddings."""
    # Convert text to BERT embeddings
    embedding1 = model.encode(text1, convert_to_numpy=True)
    embedding2 = model.encode(text2, convert_to_numpy=True)
    
    # Compute cosine similarity
    similarity = 1 - cosine(embedding1, embedding2)  # Cosine similarity
    return similarity

# Example usage
text1 = "moon was visited by NASA this year."
text2 = "NASA went to moon this year."

similarity_score = get_similarity(text1, text2)
print(f"Similarity Score: {similarity_score:.4f}")  # Closer to 1 means more similar
