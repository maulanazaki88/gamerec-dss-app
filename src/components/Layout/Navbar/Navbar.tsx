import s from "./Navbar.module.css";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className={s.header}>
      <div className={s.logo}>
        <Image
          className={s.logoImage}
          src="/icon.svg"
          alt="logo"
          width={100}
          height={100}
        />
        <p className={s.name} >GameRec</p>
      </div>
      <div className={s.menu}>
        <Link className={s.menuItem} href="/">
          Home
        </Link>
        <Link className={s.menuItem} href="/tentang-kami">
          Tentang Kami
        </Link>
        <Link className={s.menuItem} href="/cara-kerja">
          Cara Kerja
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
