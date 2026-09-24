import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Example() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap');
    
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      
      <section className="w-full flex flex-col items-center justify-start py-12">
      
        <div className="max-w-3xl text-center px-4">
          <h1 className="text-3xl font-semibold">Our Latest Creations</h1>
          <p className="text-sm text-slate-500 mt-2">
            A visual collection of our most recent works – each piece crafted
            with intention, emotion, and style.
          </p>
        </div>

        {/* Галерея снизу */}
        <div className="flex items-center gap-2 h-[400px] w-full max-w-5xl mt-10 px-4">
          {[
            "https://cdn.21st.dev/assets/mirror/21/21bf561c0452c2fae65a5c747aeba0996e6942fcb8eb3e628c50478f458065c5.jpg",
            "https://cdn.21st.dev/assets/mirror/7c/7c873d1af9cfb98c26de10dc98e807bcec8de8321936158d1b0e82c6b7f73d0c.jpg",
            "https://cdn.21st.dev/assets/mirror/35/350edca6de5b00194dbba8be86d6fc51f9192901ed127fd67855f369ff3bc9e5.jpg",
            "https://cdn.21st.dev/assets/mirror/dc/dc1338c2544ff95224a36bff0cd432e122417e6250bfd0ff82fbfceacfbf3283.jpg",
            "https://cdn.21st.dev/assets/mirror/ba/ba6557999b707efbaa73506debbc594e0703c071fdfc05951c9b355f0ad078e8.jpg",
            "https://cdn.21st.dev/assets/mirror/67/676c45dea273e8467aa434fbd08669408fe0a8b9151902e3ac39c7dc74cab416.jpg",
          ].map((src, idx) => (
            <div
              key={idx}
              className="relative group flex-grow transition-all w-56 rounded-lg overflow-hidden h-[400px] duration-500 hover:w-full"
            >
              <img
                className="h-full w-full object-cover object-center"
                src={src}
                alt={`image-${idx}`}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
