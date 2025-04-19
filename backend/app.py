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
import requests

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')

bible_embeddings = np.load("data/bible_chunk_embeddings.npy")
bible_text = np.load("data/bible_chunks.npy")

with open("data/gnostic_chunks.json","r") as f:
    gnostic = json.load(f)


comparisions = {}

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

def find_match(query):
    all_matches = []
    for q in query:
        query_embedding = create_embedding(q)
        similarities = util.cos_sim(query_embedding, bible_embeddings)[0]
        k=1
        topscore,topind = torch.topk(similarities,k=k)
        result=[]

        for idx,val in zip(topind,topscore):
            #result.append((bible_text[idx],round(val.item(),2)))
            result.append(bible_text[idx])
        all_matches.extend(result)
    return({"result":all_matches})


def sum_prompt(text, book):
    prompt = f""" Summarize the following text from the book : {book}. In the summary include core themes, ideas and theology presented
                text : {text}"""
    return prompt

def get_llm(prompt):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False 
        }
    )
    if response.status_code == 200:
        print("done.")
        result = response.json()
        return {"response": result["response"]}
    else:
        return {"error": response.text}

def explain(text1,text2,book1, book2):
    prompt = f''' for the given texts of {book1}, compare it with provided biblical passages.
    determine if their themes, ideas, theology align somewhere. If they differ explain the differences. 
    Quote from the given passages to show any of the following: similarity, inversion, refutation or alternate theology.
    {book1}: {text1}\n\n {book2}: {text2}
return the output as numbered list of answers'''
    
    return get_llm(prompt)

@app.get("/compare")
def compare_bible(book):

    if book in comparisions.keys():
        return({"result":comparisions[book]})
    
    text = gnostic[book]
    bible = find_match(text)
    # for gn in text:
    #     bible.extend(find_match(gn))
    bible_text = " ".join(bible)
    
    print("summarizing...")
    sum_gnostic = get_llm(sum_prompt(" ".join(text),book))
    #sum_bible = get_llm(sum_prompt(bible,'bible'))
    
    print("explaining...")
    result = explain(sum_gnostic['response'],bible_text, book, 'bible')
    result = result['response'].split('\n\n')
    comparisions[book] = result
    return ({"result":result})

