import "./HomePage.css";
import Layout from "../../components/layout/Layout";
import useLoginUser from "../../hooks/useLoginUser";


function HomePage() {

  const loginUser = useLoginUser();

  return (

    <Layout>
      <h1>{loginUser.username} </h1>
    </Layout>

  );
}

export default HomePage;