import RegisterForm from "../components/RegisterForm";
import { fetchNavbar } from "../lib/navbar";    

export default function Register(){
    return (
        <div className="flex min-h-screen items-start mt-6 justify-center">
            <RegisterForm />
        </div>
    )
}


export async function getServerSideProps() {
  
  const fetchedNavbar = await fetchNavbar();
  const navbar = fetchedNavbar?.data?.attributes ?? fetchedNavbar?.data ?? {};

  return { props: {  navbar } };
}