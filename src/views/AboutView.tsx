import { HelpCircle, Mail, User, Info } from "lucide-react";

const AboutView = () => {
  const faqs = [
    {
      q: "What is vikkmore?",
      a: "vikkmore is a lightweight, premium music player that uses the YouTube Data API to provide a seamless streaming experience without the bloat of a traditional browser."
    },
    {
      q: "Is it free to use?",
      a: "Absolutely. vikkmore is free and open for everyone. You can stream music instantly for free without ads or paywalls."
    },
    {
      q: "How is search powered?",
      a: "vikkmore uses the YouTube Data API powered securely via server-side environment credentials. Searches and stream queries are handled automatically without any user configuration needed."
    },
    {
      q: "Where is my data stored?",
      a: "Your library, playlists, and settings are synced to your account using secure cloud storage, so you can access them from any device."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12 pb-32">
      <section className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Info className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">About vikkmore</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your personal gateway to the world's largest music library. 
          Built for speed, simplicity, and a premium listening experience.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>
        
        <div className="grid gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card/50 border border-white/5 rounded-2xl p-6 hover:bg-card transition-colors">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary font-bold">Q:</span> {faq.q}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-primary/60 font-bold">A:</span> {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold italic">"Music is the shorthand of emotion."</h2>
            <p className="text-muted-foreground">
              vikkmore was born out of a desire for a cleaner, more focused music player. 
              No distractions, no ads—just you and the music you love.
            </p>
          </div>
          <div className="space-y-4 border-l border-white/10 pl-10">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Built by Vatsal Koriya</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <a href="mailto:vikkuploads@gmail.com" className="hover:text-primary transition-colors">
                vikkuploads@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center pt-10 border-t border-white/5 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} vikkmore. All rights reserved.</p>
        <p className="mt-2">Designed with passion for music lovers.</p>
      </footer>
    </div>
  );
};

export default AboutView;
