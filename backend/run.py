import uvicorn

if __name__ == "__main__":
    # Cambio al puerto 8001
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)