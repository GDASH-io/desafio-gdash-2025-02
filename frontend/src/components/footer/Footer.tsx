import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold text-white">Gabriel Messias</h3>
          <p className="text-sm text-slate-400">Desenvolvedor Full Stack</p>
          <p className="text-xs text-slate-500 mt-1">
            © {new Date().getFullYear()} Weather Monitor System. Todos os
            direitos reservados.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/gabrielmessias-dev/"
            target="_blank"
            className="hover:text-blue-400 transition-colors flex flex-col items-center gap-1 group"
          >
            <Linkedin className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-wider">
              LinkedIn
            </span>
          </a>

          <a
            href="https://github.com/gabrielmessias-dev"
            target="_blank"
            className="hover:text-white transition-colors flex flex-col items-center gap-1 group"
          >
            <Github className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-wider">GitHub</span>
          </a>

          <a
            href="mailto:gabrielmessias-dev@outlook.com"
            className="hover:text-red-400 transition-colors flex flex-col items-center gap-1 group"
          >
            <Mail className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-wider">Email</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
