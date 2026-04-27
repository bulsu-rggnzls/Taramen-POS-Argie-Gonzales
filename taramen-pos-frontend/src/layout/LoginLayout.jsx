export default function LoginLayout({ children }) {
   return (
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
         <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 pointer-events-none"
            style={{ backgroundImage: "url('/taramen-bg.jpg')" }} 
         />
         <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/40 pointer-events-none" />
         <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-orange/25 blur-3xl opacity-80 pointer-events-none" />
         <div className="absolute bottom-[-20%] left-[-12%] h-96 w-96 rounded-full bg-white/10 blur-3xl opacity-70 pointer-events-none" />
         <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-6 py-10">
            {children}
         </div>
      </div>
   );
}
