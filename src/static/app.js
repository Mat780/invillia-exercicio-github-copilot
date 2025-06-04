document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  let activities = {};
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Limpa as opções do select antes de adicionar novas
      activitySelect.innerHTML = '';

      // Populate activities list
      const currentEmail = document.getElementById("email").value;
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Lista de participantes formatada
        let participantsHTML = '';
        if (details.participants && details.participants.length > 0) {
          participantsHTML = `<p><strong>Participants:</strong> <ul class='participants-list'>${details.participants.map(p => `<li>${p}</li>`).join('')}</ul></p>`;
        } else {
          participantsHTML = `<p><strong>Participants:</strong> <em>No participants yet</em></p>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Adiciona listeners para os botões de cancelar inscrição
      document.querySelectorAll('.cancel-signup-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const activity = btn.getAttribute('data-activity');
          const email = btn.getAttribute('data-email');
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
              method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message || 'Inscrição cancelada com sucesso!';
              messageDiv.className = 'success';
              fetchActivities(); // Atualiza a lista
            } else {
              messageDiv.textContent = result.detail || 'Erro ao cancelar inscrição';
              messageDiv.className = 'error';
            }
            messageDiv.classList.remove('hidden');
            setTimeout(() => {
              messageDiv.classList.add('hidden');
            }, 5000);
          } catch (error) {
            messageDiv.textContent = 'Erro ao cancelar inscrição. Tente novamente.';
            messageDiv.className = 'error';
            messageDiv.classList.remove('hidden');
            console.error('Erro ao cancelar inscrição:', error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a listagem após inscrição
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Adiciona botão de cancelar inscrição ao lado do formulário, se o usuário estiver inscrito na atividade selecionada
  const cancelBtnId = 'cancel-signup-btn';
  let cancelBtn = document.getElementById(cancelBtnId);
  if (!cancelBtn) {
    cancelBtn = document.createElement('button');
    cancelBtn.id = cancelBtnId;
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancelar inscrição';
    cancelBtn.style.marginLeft = '8px';
    signupForm.appendChild(cancelBtn);
  }
  // Função para atualizar visibilidade do botão de cancelar inscrição
  function updateCancelBtn() {
    const currentEmail = document.getElementById('email').value;
    const selectedActivity = activitySelect.value;
    const activity = activities[selectedActivity];
    if (activity && activity.participants.includes(currentEmail) && currentEmail) {
      cancelBtn.style.display = '';
    } else {
      cancelBtn.style.display = 'none';
    }
  }
  activitySelect.addEventListener('change', updateCancelBtn);
  document.getElementById('email').addEventListener('input', updateCancelBtn);
  updateCancelBtn();
  cancelBtn.onclick = async () => {
    const currentEmail = document.getElementById('email').value;
    const selectedActivity = activitySelect.value;
    if (!currentEmail || !selectedActivity) return;
    try {
      const response = await fetch(`/activities/${encodeURIComponent(selectedActivity)}/signup?email=${encodeURIComponent(currentEmail)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message || 'Inscrição cancelada com sucesso!';
        messageDiv.className = 'success';
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || 'Erro ao cancelar inscrição';
        messageDiv.className = 'error';
      }
      messageDiv.classList.remove('hidden');
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 5000);
    } catch (error) {
      messageDiv.textContent = 'Erro ao cancelar inscrição. Tente novamente.';
      messageDiv.className = 'error';
      messageDiv.classList.remove('hidden');
      console.error('Erro ao cancelar inscrição:', error);
    }
  };

  // Initialize app
  fetchActivities();
});
