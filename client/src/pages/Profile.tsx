import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, LogOut, Heart, Newspaper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user favorites count
  const { data: userFavorites = [] } = trpc.news.favorites.useQuery(
    { limit: 1, offset: 0 },
    { enabled: isAuthenticated && !authLoading }
  );

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setIsLoggingOut(false);
      logout();
      navigate("/");
      toast.success("Sesión cerrada");
    },
    onError: () => {
      setIsLoggingOut(false);
      toast.error("Error al cerrar sesión");
    },
  });

  const handleLogout = () => {
    setIsLoggingOut(true);
    logoutMutation.mutate();
  };

  // Redirect to home if not authenticated
  if (!isAuthenticated && !authLoading) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-2xl">
        {/* Profile Card */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {user?.name || "Usuario"}
              </h2>
              <p className="text-muted-foreground">{user?.email || "Sin email"}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Miembro desde{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "desconocido"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-border">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={20} className="text-accent" />
                <span className="text-sm text-muted-foreground">Favoritos</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {userFavorites.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper size={20} className="text-accent" />
                <span className="text-sm text-muted-foreground">Rol</span>
              </div>
              <p className="text-3xl font-bold text-foreground capitalize">
                {user?.role || "usuario"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/favorites")}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Heart size={18} />
              Ver mis favoritos
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              variant="outline"
            >
              <LogOut size={18} />
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sobre ETH News
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            ETH News es tu hub de noticias en tiempo real sobre Ethereum y
            criptomonedas. Mantente actualizado con las últimas noticias sobre
            DeFi, NFTs, análisis de precios y más.
          </p>
          <p className="text-sm text-muted-foreground">
            Versión 1.0.0 • © 2026 ETH News
          </p>
        </div>
      </main>
    </div>
  );
}
