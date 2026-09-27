// Адрес нашего бэкенда
const BASE_URL = "https://inai-col1.fishrungames.com";

// Находим форму и блок для результата на странице
const form = document.getElementById("applicationForm");
const resultBox = document.getElementById("result");

// Вешаем обработчик на отправку формы
form.addEventListener("submit", async function (event) {
  event.preventDefault(); // чтобы страница не перезагружалась

  // Считываем то, что ввёл пользователь
  const studentId = document.getElementById("studentId").value;
  const buildingNumber = document.getElementById("buildingNumber").value;
  const roomNumber = document.getElementById("roomNumber").value;

  showLoading();

  // Список причин отказа, будем сюда добавлять текст
  const reasons = [];

  // ЗАПРОС 1: проверяем студента
  const studentResponse = await fetch(BASE_URL + "/students/" + studentId);
  if (!studentResponse.ok) {
    // Студента с таким ID нет в базе (сервер вернул ошибку, например 404)
    reasons.push("студент с ID " + studentId + " не найден");
  } else {
    const student = await studentResponse.json();
    // resident: true -> местный, resident: false -> иногородний
    const isOutOfTown = student.resident === false;
    if (!isOutOfTown) {
      reasons.push("студент не является иногородним");
    }
  }

  // ЗАПРОС 2: проверяем корпус
  const buildingResponse = await fetch(BASE_URL + "/buildings/" + buildingNumber);
  if (!buildingResponse.ok) {
    reasons.push("корпус с номером " + buildingNumber + " не найден");
  } else {
    const building = await buildingResponse.json();
    const isForStudents = building.forStudents === true;
    if (!isForStudents) {
      reasons.push("этот корпус не предназначен для студентов");
    }
  }

  // ЗАПРОС 3: проверяем комнату
  const roomResponse = await fetch(BASE_URL + "/rooms/" + roomNumber);
  if (!roomResponse.ok) {
    reasons.push("комната с номером " + roomNumber + " не найдена");
  } else {
    const room = await roomResponse.json();
    const isRoomFree = room.available === true;
    if (!isRoomFree) {
      reasons.push("комната занята");
    }
  }

  // Итоговое решение
  showResult(reasons);
});

function showLoading() {
  resultBox.className = "result loading";
  resultBox.innerHTML = "Проверяем условия...";
}

function showResult(reasons) {
  const allGood = reasons.length === 0;

  if (allGood) {
    resultBox.className = "result success";
    resultBox.innerHTML = "✅ Заявка одобрена! Все условия выполнены.";
  } else {
    resultBox.className = "result error";
    resultBox.innerHTML = "❌ Отказано.<br>Причины: " + reasons.join(", ");
  }
}
