import React from 'react';
import styles from './TitleHeader.module.css'; // Importe o CSS Module, se necessário

const TitleHeader: React.FC = () => {
  return (
    
    <div className="title-header">
        <img src="/brasil.png" />

        <div id="main-title">osu! brazilian rhythms</div>

        <div id="subtitle">
          Explore a grande variedade de músicas brasileiras no osu!
          <a href="sobre">Envie mapas e sugestões para lista ficar melhor e maior!</a>
        </div>
      </div>



  );
};

export default TitleHeader;