import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore"; // Use setDoc com merge
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"), // Adicionado CPF
  company: z.string().optional(), // Opcional
});

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompleteProfileDialog = ({ isOpen, onClose }: ProfileDialogProps) => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      cpf: "",
      company: "",
    },
  });

  useEffect(() => {
    if (user?.displayName && isOpen) {
      const names = user.displayName.split(" ");
      if (names.length > 0) {
        form.setValue("firstName", names[0]);
        form.setValue("lastName", names.slice(1).join(" "));
      }
    }
  }, [user, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, "leaders", user.uid);
      
      // Usa setDoc com merge: true para garantir que cria ou atualiza
      await setDoc(userRef, {
        full_name: `${values.firstName} ${values.lastName}`, // Padronizar com o banco
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        cpf: values.cpf,
        company: values.company || "",
        isProfileComplete: true, // Libera o acesso
        updatedAt: new Date().toISOString(),
        email: user.email, // Garante que o email está salvo
      }, { merge: true });

      toast.success("Perfil atualizado com sucesso!");
      
      if (refreshUser) await refreshUser(); // Atualiza o contexto
      onClose();
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Impede fechar clicando fora se o loading estiver ativo ou se for obrigatório
      if (!isLoading && !open) onClose();
    }}>
      <DialogContent 
        className="sm:max-w-[425px]"
        // Bloqueia fechamento via ESC ou clique fora
        onInteractOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete seu cadastro</DialogTitle>
          <DialogDescription>
            Para acessar o painel, precisamos de algumas informações adicionais.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="João" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua Empresa Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Concluir Cadastro"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};