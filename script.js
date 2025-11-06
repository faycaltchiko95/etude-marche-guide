document.addEventListener("DOMContentLoaded", function () {
  // Variables pour la navigation entre les étapes
  const totalSteps = 7;
  let currentStep = 1;

  // État de l'application (données utilisateur)
  let appData = {
    step1: { product: "", problem: "", unique: "" },
    step2: { target: "", characteristics: "", needs: "", budget: "" },
    step3: { competitors: [] },
    step4: { demand: "", trends: "", seasonality: "" },
    step5: {
      fabricationCost: 0,
      packagingCost: 0,
      laborCost: 0,
      sellingPrice: 0,
      marketingCost: 0,
      fixedCosts: 0,
    },
    step6: { testPlan: "", feedback: "" },
    step7: { positives: "", negatives: "", decision: "" },
    checklist: {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false,
      step6: false,
      step7: false,
    },
  };

  // Sélecteurs d'éléments
  const stepIndicators = document.querySelectorAll(".step-indicator");
  const stepContents = document.querySelectorAll(".step-content");
  const nextButtons = document.querySelectorAll(".next-step");
  const prevButtons = document.querySelectorAll(".prev-step");
  const restartButton = document.querySelector(".restart-btn");

  // ========================================
  // SYSTÈME DE SAUVEGARDE LOCALSTORAGE
  // ========================================

  // Charger les données sauvegardées au démarrage
  function loadSavedData() {
    const savedData = localStorage.getItem("etudeMarche");
    if (savedData) {
      try {
        appData = JSON.parse(savedData);
        populateFormFields();
        updateChecklistUI();
        showNotification("Données chargées avec succès", "success");
      } catch (e) {
        console.error("Erreur lors du chargement des données:", e);
      }
    }
  }

  // Sauvegarder les données dans localStorage
  function saveData() {
    try {
      localStorage.setItem("etudeMarche", JSON.stringify(appData));
      showNotification("Données sauvegardées", "success");
    } catch (e) {
      console.error("Erreur lors de la sauvegarde:", e);
      showNotification("Erreur de sauvegarde", "error");
    }
  }

  // Peupler les champs de formulaire avec les données sauvegardées
  function populateFormFields() {
    // Les champs seront peuplés dynamiquement lors de l'ajout des formulaires
    document.querySelectorAll("input, textarea").forEach((field) => {
      if (field.dataset.save) {
        const [step, key] = field.dataset.save.split(".");
        if (appData[step] && appData[step][key] !== undefined) {
          field.value = appData[step][key];
        }
      }
    });
  }

  // Réinitialiser toutes les données
  function resetAllData() {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser toutes vos données ? Cette action est irréversible."
      )
    ) {
      localStorage.removeItem("etudeMarche");
      appData = {
        step1: { product: "", problem: "", unique: "" },
        step2: { target: "", characteristics: "", needs: "", budget: "" },
        step3: { competitors: [] },
        step4: { demand: "", trends: "", seasonality: "" },
        step5: {
          fabricationCost: 0,
          packagingCost: 0,
          laborCost: 0,
          sellingPrice: 0,
          marketingCost: 0,
          fixedCosts: 0,
        },
        step6: { testPlan: "", feedback: "" },
        step7: { positives: "", negatives: "", decision: "" },
        checklist: {
          step1: false,
          step2: false,
          step3: false,
          step4: false,
          step5: false,
          step6: false,
          step7: false,
        },
      };
      document.querySelectorAll("input, textarea").forEach((field) => {
        field.value = "";
      });
      document
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = false));
      updateChecklistUI();
      goToStep(1);
      showNotification("Données réinitialisées", "success");
    }
  }

  // ========================================
  // SYSTÈME DE NOTIFICATIONS
  // ========================================

  function showNotification(message, type = "info") {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.className = `notification notification-${type} show`;
      setTimeout(() => {
        notification.classList.remove("show");
      }, 3000);
    }
  }

  // ========================================
  // CALCULATEUR DE RENTABILITÉ
  // ========================================

  function calculateProfitability() {
    const fabrication = parseFloat(appData.step5.fabricationCost) || 0;
    const packaging = parseFloat(appData.step5.packagingCost) || 0;
    const labor = parseFloat(appData.step5.laborCost) || 0;
    const selling = parseFloat(appData.step5.sellingPrice) || 0;
    const marketing = parseFloat(appData.step5.marketingCost) || 0;
    const fixed = parseFloat(appData.step5.fixedCosts) || 0;

    const totalCost = fabrication + packaging + labor;
    const grossProfit = selling - totalCost;
    const netProfit = grossProfit - marketing;
    const breakEven = netProfit > 0 ? Math.ceil(fixed / netProfit) : 0;
    const marginPercent = selling > 0 ? ((netProfit / selling) * 100).toFixed(1) : 0;

    // Mise à jour de l'affichage
    document.getElementById("totalCost").textContent = totalCost.toFixed(2) + "€";
    document.getElementById("grossProfit").textContent =
      grossProfit.toFixed(2) + "€";
    document.getElementById("netProfit").textContent = netProfit.toFixed(2) + "€";
    document.getElementById("breakEven").textContent = breakEven + " unités";
    document.getElementById("marginPercent").textContent = marginPercent + "%";

    // Indicateur visuel de rentabilité
    const profitIndicator = document.getElementById("profitIndicator");
    if (profitIndicator) {
      if (netProfit > 0 && marginPercent >= 30) {
        profitIndicator.innerHTML =
          '<span class="text-green-600 font-bold"><i class="fas fa-check-circle"></i> Excellente rentabilité</span>';
      } else if (netProfit > 0 && marginPercent >= 15) {
        profitIndicator.innerHTML =
          '<span class="text-yellow-600 font-bold"><i class="fas fa-exclamation-circle"></i> Rentabilité acceptable</span>';
      } else if (netProfit > 0) {
        profitIndicator.innerHTML =
          '<span class="text-orange-600 font-bold"><i class="fas fa-exclamation-triangle"></i> Rentabilité faible</span>';
      } else {
        profitIndicator.innerHTML =
          '<span class="text-red-600 font-bold"><i class="fas fa-times-circle"></i> Non rentable</span>';
      }
    }
  }

  // ========================================
  // EXPORT PDF
  // ========================================

  async function exportToPDF() {
    showNotification("Génération du PDF en cours...", "info");

    // Vérification que jsPDF est chargé
    if (typeof window.jspdf === "undefined") {
      showNotification(
        "Erreur: bibliothèque PDF non chargée. Veuillez rafraîchir la page.",
        "error"
      );
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = 280;

    // Fonction pour ajouter une nouvelle page si nécessaire
    function checkPageBreak() {
      if (yPosition > pageHeight) {
        doc.addPage();
        yPosition = 20;
      }
    }

    // Titre du document
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Rapport d'Étude de Marché", 105, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 105, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // Étape 1
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Définition du Produit", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Description: ${appData.step1.product || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Problème résolu: ${appData.step1.problem || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Unicité: ${appData.step1.unique || "Non renseigné"}`, 25, yPosition);
    yPosition += 12;
    checkPageBreak();

    // Étape 2
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. Public Cible", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Cible: ${appData.step2.target || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(
      `Caractéristiques: ${appData.step2.characteristics || "Non renseigné"}`,
      25,
      yPosition
    );
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Besoins: ${appData.step2.needs || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Budget: ${appData.step2.budget || "Non renseigné"}`, 25, yPosition);
    yPosition += 12;
    checkPageBreak();

    // Étape 3
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. Analyse Concurrentielle", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (appData.step3.competitors && appData.step3.competitors.length > 0) {
      appData.step3.competitors.forEach((comp, index) => {
        doc.text(`Concurrent ${index + 1}: ${comp}`, 25, yPosition);
        yPosition += lineHeight;
        checkPageBreak();
      });
    } else {
      doc.text("Aucun concurrent renseigné", 25, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 5;
    checkPageBreak();

    // Étape 4
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. Évaluation de la Demande", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Demande: ${appData.step4.demand || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Tendances: ${appData.step4.trends || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(
      `Saisonnalité: ${appData.step4.seasonality || "Non renseigné"}`,
      25,
      yPosition
    );
    yPosition += 12;
    checkPageBreak();

    // Étape 5
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. Analyse Financière", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const fabrication = parseFloat(appData.step5.fabricationCost) || 0;
    const packaging = parseFloat(appData.step5.packagingCost) || 0;
    const labor = parseFloat(appData.step5.laborCost) || 0;
    const selling = parseFloat(appData.step5.sellingPrice) || 0;
    const marketing = parseFloat(appData.step5.marketingCost) || 0;
    const fixed = parseFloat(appData.step5.fixedCosts) || 0;

    const totalCost = fabrication + packaging + labor;
    const grossProfit = selling - totalCost;
    const netProfit = grossProfit - marketing;
    const breakEven = netProfit > 0 ? Math.ceil(fixed / netProfit) : 0;

    doc.text(`Coût de fabrication: ${fabrication.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Coût d'emballage: ${packaging.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Coût de main d'œuvre: ${labor.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Prix de vente: ${selling.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Coût marketing: ${marketing.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Coûts fixes: ${fixed.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.text(`Profit net par unité: ${netProfit.toFixed(2)}€`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Seuil de rentabilité: ${breakEven} unités`, 25, yPosition);
    yPosition += 12;
    checkPageBreak();

    // Étape 6
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("6. Test de Marché", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Plan de test: ${appData.step6.testPlan || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Retours: ${appData.step6.feedback || "Non renseigné"}`, 25, yPosition);
    yPosition += 12;
    checkPageBreak();

    // Étape 7
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("7. Conclusion", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Points positifs: ${appData.step7.positives || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Points négatifs: ${appData.step7.negatives || "Non renseigné"}`, 25, yPosition);
    yPosition += lineHeight;
    checkPageBreak();
    doc.text(`Décision: ${appData.step7.decision || "Non renseigné"}`, 25, yPosition);

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128);
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} sur ${totalPages} - Guide d'Étude de Marché © 2025`,
        105,
        290,
        { align: "center" }
      );
    }

    // Téléchargement
    doc.save("etude-de-marche.pdf");
    showNotification("PDF généré avec succès !", "success");
  }

  // ========================================
  // SYSTÈME DE CHECKLIST
  // ========================================

  function updateChecklistUI() {
    const completed = Object.values(appData.checklist).filter((v) => v).length;
    const total = Object.keys(appData.checklist).length;
    const percentage = Math.round((completed / total) * 100);

    const progressBar = document.getElementById("checklistProgress");
    const progressText = document.getElementById("checklistText");

    if (progressBar) {
      progressBar.style.width = percentage + "%";
    }

    if (progressText) {
      progressText.textContent = `${completed}/${total} étapes complétées (${percentage}%)`;
    }

    // Mettre à jour les checkboxes individuelles
    for (let step in appData.checklist) {
      const checkbox = document.getElementById(`check-${step}`);
      if (checkbox) {
        checkbox.checked = appData.checklist[step];
      }
    }
  }

  function toggleChecklistItem(step) {
    appData.checklist[step] = !appData.checklist[step];
    updateChecklistUI();
    saveData();
  }

  // ========================================
  // NAVIGATION
  // ========================================

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

    // Sauvegarder les données de l'étape actuelle avant de changer
    saveCurrentStepData();

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

    // Recalculer si on est sur l'étape 5
    if (currentStep === 5) {
      setTimeout(calculateProfitability, 100);
    }
  }

  // Fonction pour sauvegarder les données de l'étape actuelle
  function saveCurrentStepData() {
    document.querySelectorAll("input, textarea").forEach((field) => {
      if (field.dataset.save) {
        const [step, key] = field.dataset.save.split(".");
        if (appData[step]) {
          appData[step][key] = field.value;
        }
      }
    });
    saveData();
  }

  // ========================================
  // GESTION DES ÉVÉNEMENTS GLOBAUX
  // ========================================

  // Sauvegarde automatique lors de la saisie
  document.addEventListener("input", function (e) {
    if (e.target.dataset.save) {
      const [step, key] = e.target.dataset.save.split(".");
      if (appData[step]) {
        appData[step][key] = e.target.value;
        saveData();

        // Recalcul automatique pour l'étape 5
        if (step === "step5") {
          calculateProfitability();
        }
      }
    }
  });

  // Délégation d'événements pour les boutons d'action
  document.addEventListener("click", function (e) {
    if (e.target.id === "saveDataBtn" || e.target.closest("#saveDataBtn")) {
      saveData();
    }

    if (e.target.id === "exportPDFBtn" || e.target.closest("#exportPDFBtn")) {
      exportToPDF();
    }

    if (e.target.id === "resetDataBtn" || e.target.closest("#resetDataBtn")) {
      resetAllData();
    }

    // Gestion des checkboxes de checklist
    if (e.target.classList.contains("checklist-checkbox")) {
      const step = e.target.dataset.step;
      toggleChecklistItem(step);
    }
  });

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

  // ========================================
  // INITIALISATION
  // ========================================

  // Charger les données sauvegardées au démarrage
  loadSavedData();
});
