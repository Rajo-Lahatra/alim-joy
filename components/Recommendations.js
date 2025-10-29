'use client'
import { useState } from 'react'

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState('recommendations')

  const tabs = [
    { id: 'recommendations', label: 'Recommandations' },
    { id: 'forbidden', label: 'Aliments à éviter' },
    { id: 'options', label: 'Options de repas' }
  ]

  const recommendations = [
    {
      title: "Allaitement",
      content: "L'allaitement maternel se fait toujours à la demande durant la journée (en moyenne 5 à 6 tétées). Si une tétée complète un repas solide, terminez par la tétée."
    },
    {
      title: "Respect de l'appétit",
      content: "Ne forcez jamais Joy Nathanaël à terminer son biberon. Respectez son appétit qui peut varier d'un jour à l'autre."
    },
    {
      title: "Variété alimentaire",
      content: "Proposez un seul légume et un seul fruit par jour pour qu'il apprenne le goût particulier de chaque aliment. Changez chaque jour pour faciliter l'acceptation de nouveaux aliments."
    },
    {
      title: "Persévérance",
      content: "Si Joy Nathanaël refuse un aliment, proposez-le de nouveau un autre jour, sans le forcer. Ne vous découragez pas après plusieurs refus."
    },
    {
      title: "Cuisson et préparation",
      content: "Les légumes doivent être cuits sans adjonction de sel. Ajoutez 1 cuillère à café d'huile végétale crue (colza, noix, soja, maïs, olive) ou une noisette de beurre frais."
    },
    {
      title: "Quantités",
      content: "Viande/poisson : 10g (2 cuillères à café). Pour les légumes, utilisez la pomme de terre comme liant pour les légumes fluides."
    }
  ]

  const forbiddenVegetables = [
    "Choux", "Raves", "Navets", "Oignons", "Vert de poireaux", 
    "Céleris", "Persil", "Salsifis", "Cardons", "Artichauts", 
    "Fenouil", "Poivrons", "Aubergines"
  ]

  const forbiddenProteins = [
    "Abats",
    "Charcuterie (sauf jambon cuit découenné)",
    "Poissons : anguille, barbeau, brême, carpe, silure, espadon, marlin, siki, requin, lamproie"
  ]

  const otherRestrictions = [
    "Œuf peu cuit (attendre 1 an)",
    "Sucre ajouté dans les fruits",
    "Sel dans la préparation des légumes",
    "Jus de fruits (non indispensables)"
  ]

  const mealOptions = {
    morning: [
      "210 ml d'eau faiblement minéralisée + 7 mesures arasées de lait 2ème âge",
      "Option avec céréales : Ajouter 1 à 2 cuillères à soupe de farines ou céréales 2ème âge (avec gluten)",
      "Augmentation possible : +30 ml d'eau + 1 mesure arasée (si l'appétit l'exige)"
    ],
    lunch: [
      "Option 1 : Purée de légumes maison + 10g de viande ou poisson + dessert de fruits",
      "Option 2 : Petit pot de 200g légumes-viande ou légumes-poisson + petit pot de 130g de fruits",
      "Option 3 : Biberon de soupe avec 5 mesures de lait 2ème âge"
    ],
    snack: [
      "Option 1 : Laitage bébé + biscuit + fruit",
      "Option 2 : Biberon 210ml + 7 mesures lait + céréales",
      "Option 3 : Purée de légumes + biberon 120-150ml lait"
    ]
  }

  return (
    <div className="tab-container">
      <div className="tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className={`tab-content ${activeTab === 'recommendations' ? 'active' : ''}`}>
        <div className="card">
          <h2>Recommandations Générales</h2>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <h3>{rec.title}</h3>
                <p>{rec.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`tab-content ${activeTab === 'forbidden' ? 'active' : ''}`}>
        <div className="card">
          <h2>Aliments à Éviter</h2>
          <div className="info-section">
            <div className="info-box">
              <h3>Légumes interdits</h3>
              <div className="forbidden-item">
                <ul>
                  {forbiddenVegetables.map((veg, index) => (
                    <li key={index}>{veg}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="info-box">
              <h3>Viandes et poissons à éviter</h3>
              <div className="forbidden-item">
                <ul>
                  {forbiddenProteins.map((protein, index) => (
                    <li key={index}>{protein}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="info-box">
              <h3>Autres restrictions</h3>
              <div className="forbidden-item">
                <ul>
                  {otherRestrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`tab-content ${activeTab === 'options' ? 'active' : ''}`}>
        <div className="card">
          <h2>Options de Repas Détaillées</h2>
          <div className="info-section">
            <div className="info-box">
              <h3>Options du Matin</h3>
              <ul>
                {mealOptions.morning.map((option, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{option}</li>
                ))}
              </ul>
            </div>
            <div className="info-box">
              <h3>Options du Repas de Midi</h3>
              <ul>
                {mealOptions.lunch.map((option, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{option}</li>
                ))}
              </ul>
            </div>
            <div className="info-box">
              <h3>Options du Goûter</h3>
              <ul>
                {mealOptions.snack.map((option, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{option}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}