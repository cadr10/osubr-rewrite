import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const { data: session, status } = useSession();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  let left = (
    <div className="left">
      <Link href="/" legacyBehavior>
        <a className="bold" data-active={isActive("/")}>
          osu! br 🎶
        </a>
      </Link>
      <style jsx>{`
        .bold {
          font-weight: bold;
        }
        a {
          text-decoration: none;
          color: #000;
          display: inline-block;
        }
        .left a[data-active="true"] {
          color: gray;
        }
        a + a {
          margin-left: 1rem;
        }
      `}</style>
    </div>
  );

  let right = null;

  if (status === "loading") {
    right = (
      <div className="right">
        <p>Validating session ...</p>
        <style jsx>{`
          .right {
            margin-left: auto;
          }
        `}</style>
      </div>
    );
  }

  if (!session) {
    right = (
      <div className="right">
        <Link href="/api/auth/signin" legacyBehavior>
          <a data-active={isActive("/signup")} className="button">
            Logar
          </a>
        </Link>
        <style jsx>{`
          a {
            text-decoration: none;
            color: #000;
            display: inline-block;
          }
          a + a {
            margin-left: 1rem;
          }
          .right {
            margin-left: auto;
          }
          .button {
            border: 1px solid #61a363;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            color: #61a363;
            background-color: transparent;
            transition: background-color 0.2s, color 0.2s;
          }
          .button:hover {
            background-color: #61a363;
            color: white;
          }
        `}</style>
      </div>
    );
  }

  if (session) {
    left = (
      <div className="left">
        <Link href="/" legacyBehavior>
          <a className="bold" data-active={isActive("/")}>
            osu! br 🎶
          </a>
        </Link>
        <style jsx>{`
          .bold {
            font-weight: bold;
          }
          a {
            text-decoration: none;
            color: #000;
            display: inline-block;
          }
          .left a[data-active="true"] {
            color: gray;
          }
          a + a {
            margin-left: 1rem;
          }
        `}</style>
      </div>
    );
    right = (
      <div className="right">
        <div className="button-group">
          {session.user.isAdmin && (
            <Link href="/populate" legacyBehavior>
              <a className="button">Populate</a>
            </Link>
          )}
          <Link href="/enviar" legacyBehavior>
            <a className="button">Enviar música</a>
          </Link>
        </div>

        <div className="user-menu" ref={menuRef}>
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User profile picture"}
              className="profile-pic"
              onClick={() => setMenuOpen(!isMenuOpen)}
            />
          )}

          {isMenuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-info">
                Logado como: <strong>{session.user.name}</strong>
              </div>
              <a onClick={() => signOut()} className="dropdown-item">
                Sair
              </a>
            </div>
          )}
        </div>

        <style jsx>{`
          .right {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .button-group {
            display: flex;
            gap: 0.5rem;
          }
          .button {
            text-decoration: none;
            color: #61a363;
            display: inline-block;
            border: 1px solid #61a363;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            background-color: transparent;
            transition: background-color 0.2s, color 0.2s;
          }
          .button:hover {
            background-color: #61a363;
            color: white;
          }
          .user-menu {
            position: relative;
            display: inline-block;
          }
          .profile-pic {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid #ddd;
            transition: border-color 0.2s;
          }
          .profile-pic:hover {
            border-color: #61a363;
          }
          .dropdown-menu {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            z-index: 1000;
            min-width: 180px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .dropdown-info {
            padding: 0.75rem 1rem;
            font-size: 0.9em;
            color: #555;
            border-bottom: 1px solid #eee;
          }
          .dropdown-item {
            display: block;
            padding: 0.75rem 1rem;
            color: #cc0000;
            cursor: pointer;
            text-align: left;
            text-decoration: none;
          }
          .dropdown-item:hover {
            background-color: #fff5f5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <nav>
      {left}
      {right}
      <style jsx>{`
        nav {
          display: flex;
          align-items: center;
          padding: 1rem 0;
          
        }
      `}</style>
    </nav>
  );
};

export default Header;