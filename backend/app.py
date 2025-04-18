from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import faiss
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import os
import torch
import re
import json

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


@app.get("/home")
def home():
    file_list = os.listdir("data/gnostic_texts")
    txt_file = sorted([f.split('.')[0].strip() for f in file_list if f.endswith('.txt')])
    return({"files" : txt_file})

@app.get("/get_text")
def get_book_text(file : str):
    # file_path = os.path.join("data/gnostic_texts",file)
    # with open(file_path+".txt","r",encoding='utf-8') as f:
    #     text = f.read()
    # i = text.split('--',1)
    # ii = i[1].split(":",1)
    # title = i[0].strip()
    # translator = ii[0].strip()
    # body = ii[1].strip()
    # return({"title":title, "translator" : translator, "body" : body})
    with open("data/gnostic_chunks.json","r") as f:
        gnostic = json.load(f)
    
    return {"title":file, "body":gnostic[file]}

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
    return embeddings

@app.get("/search")
def find_match(query:str):
    query_embedding = create_embedding(query)
    similarities = util.cos_sim(query_embedding, bible_embeddings)[0]
    k=10
    topscore,topind = torch.topk(similarities,k=k)
    botscore,botind = torch.topk(-similarities,k=k)
    print(topscore)
    result=[]

    # for i,s in enumerate(sent):
    #     idx = topind[i].item()
    #     result.append((bible_text[idx],topscore[i].item()))

    for idx,val in zip(topind,topscore):
        result.append((bible_text[idx],round(val.item(),2)))
    return({"result":result})
