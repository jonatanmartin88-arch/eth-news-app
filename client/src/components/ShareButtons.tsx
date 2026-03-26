import { Button } from "@/components/ui/button";
import { Share2, Twitter, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `${title} - ETH News`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = `${title}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareTelegram = () => {
    const text = `${title}\n\n${url}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(telegramUrl, "_blank");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Compartir:</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareTwitter}
          title="Compartir en Twitter"
          className="flex items-center gap-1"
        >
          <Twitter size={16} />
          <span className="hidden sm:inline">Twitter</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareWhatsApp}
          title="Compartir en WhatsApp"
          className="flex items-center gap-1"
        >
          <MessageCircle size={16} />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareTelegram}
          title="Compartir en Telegram"
          className="flex items-center gap-1"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Telegram</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          title="Copiar enlace"
          className="flex items-center gap-1"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">{copied ? "Copiado!" : "Copiar"}</span>
        </Button>
      </div>
    </div>
  );
}
