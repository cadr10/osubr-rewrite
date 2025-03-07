import React, { useState } from "react";
import Layout from "../components/Layout";
import Router from "next/router";

const Draft: React.FC = () => {
  const [id, setId] = useState("");
  const [genres, setGenres] = useState("");
  const [error, setError] = useState("");

  const extractId = (input: string): number | null => {
    const regex = /(\d+)/;
    const match = input.match(regex);
    return match ? parseInt(match[1], 10) : null;
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
  
    const genresArray = genres.split(',').map(genre => genre.trim());
  
    const extractedId = extractId(id);
    if (!extractedId) {
      setError("ID inválido. Por favor, insira um link válido ou o próprio número.");
      return;
    }
  
    try {
      const body = { id: extractedId, genres: genresArray };
      const response = await fetch(`/api/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        return;
      }
  
      await Router.push("/");
    } catch (error) {
      console.error(error);
      setError("Erro ao processar sua request");
    }
  };

  return (
    <Layout>
      <div>
        <form onSubmit={submitData}>
          <h1>Adicionar nova música na listagem</h1>
          <p>Envie uma música com seus respectivos gêneros para ser adicionada a lista!</p>
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
  
          <p>Cole o link da música abaixo:</p>
          <input
            autoFocus
            onChange={(e) => setId(e.target.value)}
            placeholder="Cole o link da música aqui"
            type="text"
            value={id}
          />
          <p>Adicione os gêneros da música abaixo.</p>
          <textarea
            cols={50}
            onChange={(e) => setGenres(e.target.value)}
            placeholder="Digite os gêneros aqui"
            rows={8}
            value={genres}
          />
          <input disabled={!genres || !id} type="submit" value="Enviar" />
          <a className="back" href="#" onClick={() => Router.push("/")}>
            Cancelar
          </a>
        </form>
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
  
        input[type="text"],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }
  
        input[type="submit"] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }
  
        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Draft;
