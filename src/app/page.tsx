/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

export default function Home() {
  return (
    <main className="text-xl font-mono flex flex-col p-10 h-screen">
      <span className="comment">// this is a comment </span>
      <nav className="flex space-x-4 mb-4">
        <a
          href="#home"
          className="focus:bg-[#ffffff1a] focus-within:select-all"
        >
          home
        </a>
        <a href="#about" className="focus:bg-[#ffffff1a]">
          about
        </a>
        <a href="#services" className="focus:bg-[#ffffff1a]">
          services
        </a>
        <a href="#contact" className="focus:bg-[#ffffff1a]">
          contact
        </a>
      </nav>
      <span>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste, totam
        maiores repellendus odio eligendi explicabo deserunt tempora qui
        corrupti sequi quod commodi quisquam quam, vero hic magnam ad temporibus
        natus?
      </span>
      <div className="w-full h-10 p-2">
        <span>&gt;</span>
        <input
          type="text"
          className="bg-transparent outline-none  ml-2 w-11/12"
        />
      </div>
    </main>
  );
}
