import { User, Loader2, Lock } from "lucide-react";
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
import IAlert from "../components/custom/Alert";

export default function Login() {
   const navigate = useNavigate();
   const { 
      isLoading,
      errorMessage,
      clearError
   } = useAuthStore();

   const { mutate: login } = useLogin();

   const onSubmit = async (data) => {
      clearError();
      login(data, {
         onSuccess: () => {
            navigate("/dashboard", { replace: true });
         }
      });
   };

   return (
      <LoginLayout>
         <main className="w-full max-w-lg mx-auto flex items-center justify-center min-h-screen p-6">
            <ICard
               logo={
                  <div className="mb-4 mt-8">  
                     <img 
                        src="/taramen.svg" 
                        alt="Ta'ramen POS"
                        className="h-28 w-auto mx-auto block"
                     />        
                  </div>
               }
               title="Welcome Back"
               description="Please enter your details"
               descriptionClassName="text-gray-400 text-lg font-normal"
               cardClassName="text-center w-full bg-white border border-white/60 shadow-2xl rounded-3xl"
               cardContentClassName="pb-8 px-10 pt-12"
               cardTitleClassName="text-xl text-gray-900 font-bold"
               cardHeaderClassName="gap-1"
            >
               <Form className="flex flex-col" onSubmit={onSubmit} schema={loginSchema}>
                  <div className="flex flex-col gap-6">
                     <IInput 
                        name="email" 
                        type="email"
                        placeholder="Enter username..." 
                        className="bg-white border border-black h-12 !text-lg !pl-12 rounded-lg shadow-sm placeholder:text-gray-400"
                        wrapperClassName="gap-2"
                        prefix={<User className="size-6 text-gray-600" />}
                     />
                     <IInput
                        name="password"
                        type="password"
                        placeholder="Enter password..."
                        className="bg-white border border-black h-12 !text-lg !pl-12 rounded-lg shadow-sm placeholder:text-gray-400"
                        prefix={<Lock className="size-6 text-gray-600" />}
                     />
                  </div>
                  <div className="mt-12">
                     <IButton 
                        type="submit" 
                        variant="taramenRed" 
                        className="w-full h-14 text-base !font-normal tracking-wide flex items-center justify-center gap-2 rounded-lg" 
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              SIGNING IN...
                           </>
                        ) : "Continue"}
                     </IButton>
                  </div>
                  {errorMessage && (
                     <div className="pt-2">
                        <IAlert variant="destructive" description={errorMessage} />
                     </div>
                  )}
               </Form>
            </ICard>
         </main>

      </LoginLayout>
   );
}
