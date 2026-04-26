import { User, Loader2, ShieldCheck, Clock3, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IButton from "../components/custom/Button";
import ICard from "../components/custom/Card";
import Form from "../components/custom/Form";
import IInput from "../components/custom/Input";
import Paragraph from "../components/custom/Paragraph";
import Title from "../components/custom/Title";
import LoginLayout from "../layout/LoginLayout";
import { loginSchema } from "../shared/lib/zod/schema/login";
import { useLogin } from "../hooks/useAuth";
import useAuthStore from "../stores/useAuthStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import IAlert from "../components/custom/Alert";
import { Badge } from "../components/ui/badge";

export default function Login() {
   const navigate = useNavigate();
   const { 
      isLoading,
      errorMessage,
      clearError,
      openForgotPasswordModal,
      isForgotPasswordModalOpen,
      closeForgotPasswordModal
   } = useAuthStore();

   const { mutate: login } = useLogin();
   const highlights = [
      {
         icon: UtensilsCrossed,
         title: "Fast service",
         description: "Keep orders moving with a focused workflow.",
      },
      {
         icon: ShieldCheck,
         title: "Secure access",
         description: "Quick sign-in with protected sessions. ",
      },
      {
         icon: Clock3,
         title: "Clear pacing",
         description: "Stay aligned on tables and timing.",
      },
   ];

   const onSubmit = async (data) => {
      clearError(); // Clear any previous errors
      login(data, {
         onSuccess: () => {
            navigate("/dashboard", { replace: true });
         }
      });
   };

   return (
      <LoginLayout>
         <main className="w-full max-w-none mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <section className="order-2 md:order-1 text-white space-y-7 md:space-y-9">
               <header className="flex flex-col items-start gap-4">
                  <Badge className="bg-white/15 text-white border border-white/20 px-3 py-1 text-sm tracking-wide">
                     Ta'ramen POS
                  </Badge>
                  <Title size="3xl" className="text-white leading-tight sm:text-4xl md:text-4xl">
                     Welcome back. Let&apos;s keep service moving.
                  </Title>
                  <Paragraph size="md" variant="default" className="text-white/75 max-w-xl">
                     Sign in to manage orders, tables, and your shift with a clean, kitchen-ready flow.
                  </Paragraph>
               </header>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlights.map((item) => {
                     const Icon = item.icon;
                     return (
                        <li
                           key={item.title}
                           className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 md:p-5 backdrop-blur-sm"
                        >
                           <div className="rounded-xl bg-white/15 p-2.5">
                              <Icon className="size-5 md:size-6 text-white" />
                           </div>
                           <div className="space-y-1">
                              <span className="text-base font-semibold">{item.title}</span>
                              <Paragraph size="sm" variant="default" className="text-white/70">
                                 {item.description}
                              </Paragraph>
                           </div>
                        </li>
                     );
                  })}
               </ul>
               <Paragraph size="sm" variant="default" className="text-white/60">
                  Need access? Contact your manager to add or reset your account.
               </Paragraph>
            </section>

            <ICard
               logo={
                  <div className="flex flex-col items-center">
                     <div className="rounded-2xl bg-orange/10 border border-orange/20 p-3">
                        <img 
                           src="/Taramen.png" 
                           alt="Ta'ramen POS"
                           className="h-12 md:h-14 w-auto block"
                        />
                     </div>
                  </div>
               }
               title="Sign In"
               description="Enter your credentials to continue."
               descriptionClassName="text-gray-500 text-sm md:text-base"
               cardClassName="order-1 md:order-2 text-center w-full bg-white/95 backdrop-blur border border-white/60 shadow-2xl/70 rounded-3xl"
               cardContentClassName="pb-10 px-8 md:px-10 pt-4"
               cardTitleClassName="text-2xl md:text-3xl text-gray-900"
               cardHeaderClassName="gap-3 pt-8 md:pt-10"
            >
               <Form className="flex flex-col gap-6 md:gap-7" onSubmit={onSubmit} schema={loginSchema}>
                  <IInput 
                     name="email" 
                     type="email"
                     label="Email"
                     placeholder="Enter your email" 
                     labelClassName="font-semibold text-sm md:text-sm text-gray-700"
                     className="bg-white/90 border border-gray-200 h-12 md:h-14 text-base md:text-base px-4 md:px-5 rounded-xl shadow-sm"
                     wrapperClassName="gap-2"
                     suffix={<User className="size-5 text-gray-500" />}
                  />
                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <div className="font-semibold text-sm md:text-sm text-gray-700">Password</div>
                        <IButton 
                           type="button" 
                           variant="ghost" 
                           className="text-sm md:text-sm text-orange hover:text-orange/80 p-0 h-auto font-semibold"
                           onClick={openForgotPasswordModal}
                        >
                           Forgot password?
                        </IButton>
                     </div>
                     <IInput
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="bg-white/90 border border-gray-200 h-12 md:h-14 text-base md:text-base px-4 md:px-5 rounded-xl shadow-sm"
                     />
                  </div>
                  <IButton 
                     type="submit" 
                     variant="orange" 
                     className="w-full font-semibold h-12 md:h-14 text-base md:text-base tracking-wide flex items-center justify-center gap-2 rounded-xl" 
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <>
                           <Loader2 className="h-4 w-4 animate-spin" />
                           SIGNING IN...
                        </>
                     ) : "SIGN IN"}
                  </IButton>
                  {errorMessage && (
                     <div className="pt-2">
                        <IAlert variant="destructive" description={errorMessage} />
                     </div>
                  )}
               </Form>
            </ICard>
         </main>

         <Dialog
            open={isForgotPasswordModalOpen}
            onOpenChange={(open) => !open && closeForgotPasswordModal()}
         >
            <DialogContent>
               <DialogHeader>
                  <Title size="lg" className="text-gray-900">
                     Forgot Password
                  </Title>
                  <Paragraph size="sm" className="text-gray-600">
                     Please contact the administrator to reset your password.
                  </Paragraph>
               </DialogHeader>
               <div className="flex justify-end">
                  <IButton onClick={closeForgotPasswordModal} variant="outline">
                     Close
                  </IButton>
               </div>
            </DialogContent>
         </Dialog>
      </LoginLayout>
   );
}
