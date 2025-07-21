// pages/sobre.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import TitleHeader from '../components/TitleHeader';
import prisma from '../lib/prisma';

type Admin = {
  name: string;
  osu_id: string | null;
};

type SobrePageProps = {
  admins: Admin[];
};

const SobrePage: React.FC<SobrePageProps> = ({ admins }) => {
  return (
    <Layout>
      <TitleHeader/>
      <div className="sobre-container">
        <div className="sobre-content">
          <h2>Sobre o projeto</h2>
          <p>
            A música brasileira tem muitos gêneros e ritmos. Existem muitos mapas de músicas brasileiras, mas fica difícil de achá-los porque a listagem do osu! não comporta a busca de músicas em português através de um filtro e quase ninguém usa o sistema de tags.
          </p>
          <p>
            Esta plataforma foi criada para resolver esse problema, centralizando e divulgando os beatmaps de artistas brasileiros para toda a comunidade.
          </p>
          
          <h2>Como Ajudar?</h2>
          <p>
            A forma mais direta de ajudar é enviando mapas que você conhece e que ainda não estão em nossa lista.
          </p>
          <ul>
            <li>
              Você pode enviar sugestões através da nossa <a href="/enviar">página de envio de mapas</a>.
            </li>
            <li>
              Além disso, a melhor forma de ajudar a cena é criando mais mapas de músicas brasileiras e apoiando os mappers!
            </li>
          </ul>
          <p>
            ❗ As regras para os mapas estarem na lista são as mesmas do osu!: <a href="https://osu.ppy.sh/wiki/en/Rules/Song_content_rules" target="_blank" rel="noopener noreferrer">Regras de conteúdo de música</a> e <a href="https://osu.ppy.sh/wiki/en/Rules/Explicit_content" target="_blank" rel="noopener noreferrer">conteúdo explícito</a>.
          </p>

          <h2>Equipe do Projeto</h2>
          <p>Estes são os administradores que mantêm o projeto funcionando:</p>
          <ul>
            {admins.map((admin) => (
              <li key={admin.name}>
                {admin.osu_id ? (
                  <a href={`https://osu.ppy.sh/users/${admin.osu_id}`} target="_blank" rel="noopener noreferrer">
                    {admin.name}
                  </a>
                ) : (
                  admin.name
                )}
              </li>
            ))}
          </ul>

          <h2>Agradecimentos</h2>
          <p>
            <b>Obrigado à <a href="https://osu.ppy.sh/users/2708093" target="_blank" rel="noopener noreferrer">Flauta</a></b> por me ajudar com essa ideia aleatória 🙂 Se não fosse essa ajuda, eu provavelmente estaria travado em alguma etapa e talvez esse projeto nem existisse. Ela que fez o design do site!
          </p>
          <p>
            <b>Obrigado ao <a href="https://osu.ppy.sh/users/15821708" target="_blank" rel="noopener noreferrer">Sebola</a></b> pelo code refactor, por adicionar o preview nas músicas e pela ajuda geral com JavaScript na versão original do site.
          </p>
          <h2>Privacidade</h2>
          <p>O site funciona como um anexador de mapas. Qualquer mapa pode ser encontrado em provedores de pesquisa.</p>
          <p>Caso você tenha deletado seu mapa e ele continue na lista (e você se incomoda com isso), mande mensagem para algum admin no osu!.</p>
          
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const admins = await prisma.user.findMany({
    where: {
      isAdmin: true,
    },
    select: {
      name: true,
      osu_id: true, 
    },
  });

  return {
    props: {
      admins,
    },
    
    revalidate: 3600, 
  };
};

export default SobrePage;