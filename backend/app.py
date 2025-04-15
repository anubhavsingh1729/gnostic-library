from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import faiss
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import os
import torch
import re

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')

bible_embeddings = np.load("data/bible_embeddings.npy")
bible_text = np.load("data/bible_sent.npy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow access from frontend. For production, restrict this to your frontend’s domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return("started...")

def clean_text(text):
    # Remove brackets but keep the content inside
    text = re.sub(r'[\[\]\(\)\{\}]', '', text)
    # Remove single and double quotes
    text = re.sub(r'[\"\']', '', text)
    text = re.sub(r'\.{3,}', '', text)
    # Remove all characters except alphabets, spaces, and .
    text = re.sub(r'[^a-zA-Z. ]+', '', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    # Trim leading/trailing whitespace
    return text.strip()

def create_embedding(text):
    sent = clean_text(text)
    embeddings = model.encode([sent],convert_to_numpy=True)
    print(sent)
    return sent,embeddings

@app.get("/search")
def find_match(query:str):
    sent, query_embedding = create_embedding(query)
    similarities = util.cos_sim(query_embedding, bible_embeddings)[0]
    k = 10
    topscore,topind = torch.topk(similarities,k=k)
    result=[sent]

    # for i,s in enumerate(sent):
    #     idx = topind[i].item()
    #     result.append((bible_text[idx],topscore[i].item()))

    for idx,val in zip(topind,topscore):
        result.append((bible_text[idx], f"score: {val:.4f}"))
    return result
