document.addEventListener("DOMContentLoaded", function () {
  // Variables pour la navigation entre les étapes
  const totalSteps = 7;
  let currentStep = 1;

  // Sélecteurs d'éléments
  const stepIndicators = document.querySelectorAll(".step-indicator");
  const stepContents = document.querySelectorAll(".step-content");
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");
  const restartButton = document.querySelector(".restart-btn");

  // Initialisation des gestionnaires d'événements pour les boutons
  nextButtons.forEach((button) => {
    button.addEventListener("click", goToNextStep);
  });

  prevButtons.forEach((button) => {
    button.addEventListener("click", goToPrevStep);
  });

  // Initialisation des gestionnaires d'événements pour les indicateurs d'étapes
  stepIndicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToStep(index + 1));
  });

  // Gestionnaire d'événement pour le bouton de redémarrage
  if (restartButton) {
    restartButton.addEventListener("click", () => goToStep(1));
  }

  // Fonction pour aller à l'étape suivante
  function goToNextStep() {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }

  // Fonction pour aller à l'étape précédente
  function goToPrevStep() {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  // Fonction pour aller à une étape spécifique
  function goToStep(step) {
    // S'assurer que l'étape est valide
    if (step < 1 || step > totalSteps) return;

    // Mettre à jour l'étape actuelle
    currentStep = step;

    // Mettre à jour les indicateurs d'étape
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove("active", "completed");

      if (index + 1 === currentStep) {
        indicator.classList.add("active");
      } else if (index + 1 < currentStep) {
        indicator.classList.add("completed");
      }
    });

    // Mettre à jour le contenu visible
    stepContents.forEach((content, index) => {
      content.classList.remove("active", "animate-fade-in");

      if (index + 1 === currentStep) {
        // Ajouter une courte attente pour permettre l'animation
        setTimeout(() => {
          content.classList.add("active", "animate-fade-in");
        }, 50);
      }
    });

    // Faire défiler vers le haut
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Animation au survol des cartes d'exemple
  const exampleCards = document.querySelectorAll(".example-card");
  exampleCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow =
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });
});
