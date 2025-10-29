import Header from '../components/Header'
import FoodTracker from '../components/FoodTracker'
import Recommendations from '../components/Recommendations'
import NetlifyWarning from '../components/NetlifyWarning'


export default function Home() {
  return (
    <>
      <Header />
      
      <div className="container">
        <FoodTracker />
        <Recommendations />
      </div>
      
      <footer className="footer">
        <p>Application basée sur les recommandations du Dr AIDIBE KADRA Sarah - Pédiatre</p>
        <p>Les informations recueillies sont utilisées uniquement pour le suivi alimentaire de Joy Nathanaël</p>
      </footer>
    </>
  )
}