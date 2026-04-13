// массив с начальными данными анкет
// каждый объект - это одна анкета с оценками по 8 критериям

const initialProcesses = [
  {
    id: 1,
    name: "Анкета удовлетворённости клиентов",
    type: "Клиентская",
    cycleTime: 2, cost: 3, automation: 2, rework: 4,
    strategicValue: 5, criticality: 4, innovation: 5, techDebt: 2
  },
  {
    id: 2,
    name: "Опрос вовлечённости сотрудников",
    type: "HR-исследование",
    cycleTime: 1, cost: 2, automation: 1, rework: 5,
    strategicValue: 5, criticality: 5, innovation: 5, techDebt: 1
  },
  {
    id: 3,
    name: "Анкета обратной связи по продукту",
    type: "Маркетинговая",
    cycleTime: 3, cost: 3, automation: 2, rework: 3,
    strategicValue: 4, criticality: 5, innovation: 4, techDebt: 2
  },
  {
    id: 4,
    name: "Опрос после обучения (NPS)",
    type: "Внутренняя",
    cycleTime: 2, cost: 2, automation: 2, rework: 4,
    strategicValue: 3, criticality: 4, innovation: 3, techDebt: 2
  },
  {
    id: 5,
    name: "Ежегодное исследование рынка",
    type: "Маркетинговая",
    cycleTime: 4, cost: 4, automation: 3, rework: 2,
    strategicValue: 3, criticality: 4, innovation: 3, techDebt: 3
  },
  {
    id: 6,
    name: "Анкета оценки кандидата",
    type: "HR-исследование",
    cycleTime: 1, cost: 2, automation: 1, rework: 5,
    strategicValue: 4, criticality: 3, innovation: 4, techDebt: 1
  }
];

// рабочая копия - её будем менять (добавлять/удалять)
// используем spread чтобы не менять оригинал
let processes = [...initialProcesses];


// считаем среднее по операционным критериям
function calcOperational(process) {
  return (process.cycleTime + process.cost + process.automation + process.rework) / 4;
}

// считаем среднее по стратегическим критериям
function calcStrategic(process) {
  return (process.strategicValue + process.criticality + process.innovation + process.techDebt) / 4;
}

// определяем зону матрицы
// порог деления - 3.0
function getZone(process) {
  var op = calcOperational(process);
  var st = calcStrategic(process);

  if (op < 3 && st >= 3) return 1; // срочная доработка
  if (op >= 3 && st >= 3) return 2; // развитие
  if (op < 3 && st < 3) return 3;  // стандартизация
  return 4;                          // мониторинг
}


// фильтрация по зоне
var activeFilter = 'all';

function filterByZone(value) {
  activeFilter = value;
  renderAll();
}

// возвращает только те анкеты которые нужно показать
function getFilteredProcesses() {
  if (activeFilter === 'all') {
    return processes;
  }
  return processes.filter(function(p) {
    return getZone(p) === Number(activeFilter);
  });
}


// сортировка
var currentSort = { field: null, ascending: true };

function sortProcesses(field) {
  // если кликнули по тому же столбцу - меняем направление
  if (currentSort.field === field) {
    currentSort.ascending = !currentSort.ascending;
  } else {
    currentSort.field = field;
    currentSort.ascending = true;
  }

  processes.sort(function(a, b) {
    var valA, valB;

    if (field === 'name' || field === 'type') {
      valA = a[field];
      valB = b[field];
      if (valA < valB) return currentSort.ascending ? -1 : 1;
      if (valA > valB) return currentSort.ascending ? 1 : -1;
      return 0;
    }

    if (field === 'operational') {
      valA = calcOperational(a);
      valB = calcOperational(b);
    } else if (field === 'strategic') {
      valA = calcStrategic(a);
      valB = calcStrategic(b);
    } else if (field === 'zone') {
      valA = getZone(a);
      valB = getZone(b);
    }

    return currentSort.ascending ? valA - valB : valB - valA;
  });

  renderAll();
}


// рисуем таблицу
function renderTable() {
  var tbody = document.getElementById('table-body');
  tbody.innerHTML = ''; // очищаем перед перерисовкой

  getFilteredProcesses().forEach(function(process) {
    var op = calcOperational(process).toFixed(2);
    var st = calcStrategic(process).toFixed(2);
    var zone = getZone(process);

    var row = document.createElement('tr');
    row.innerHTML =
      '<td>' + process.name + '</td>' +
      '<td>' + process.type + '</td>' +
      '<td>' + op + '</td>' +
      '<td>' + st + '</td>' +
      '<td>Зона ' + zone + '</td>' +
      '<td><button class="btn-delete" data-id="' + process.id + '">Удалить</button></td>';

    tbody.appendChild(row);
  });
}

// рисуем матрицу
function renderMatrix() {
  // очищаем карточки во всех зонах
  for (var i = 1; i <= 4; i++) {
    var zoneEl = document.getElementById('zone-' + i);
    var chips = zoneEl.querySelectorAll('.process-chip');
    chips.forEach(function(chip) {
      chip.remove();
    });
  }

  // добавляем карточки анкет в нужные зоны
  getFilteredProcesses().forEach(function(process) {
    var zone = getZone(process);
    var zoneEl = document.getElementById('zone-' + zone);

    var chip = document.createElement('div');
    chip.className = 'process-chip';
    chip.textContent = process.name;
    zoneEl.appendChild(chip);
  });

  // обновляем счётчик в заголовках зон
  var zoneNames = {
    1: 'Срочная доработка',
    2: 'Развитие',
    3: 'Стандартизация',
    4: 'Мониторинг'
  };

  for (var i = 1; i <= 4; i++) {
    var zoneEl = document.getElementById('zone-' + i);
    var count = zoneEl.querySelectorAll('.process-chip').length;
    var h3 = zoneEl.querySelector('h3');
    h3.textContent = zoneNames[i] + ' (' + count + ')';
  }
}

// перерисовываем всё и сохраняем
function renderAll() {
  renderTable();
  renderMatrix();
  saveToStorage();
}


// обработчик формы добавления
function handleAddProcess(event) {
  event.preventDefault(); // отменяем перезагрузку страницы

  // считаем новый id (максимальный + 1)
  var maxId = 0;
  processes.forEach(function(p) {
    if (p.id > maxId) maxId = p.id;
  });

  var newProcess = {
    id: maxId + 1,
    name:           document.getElementById('inp-name').value,
    type:           document.getElementById('inp-type').value,
    cycleTime:      Number(document.getElementById('inp-cycleTime').value),
    cost:           Number(document.getElementById('inp-cost').value),
    automation:     Number(document.getElementById('inp-automation').value),
    rework:         Number(document.getElementById('inp-rework').value),
    strategicValue: Number(document.getElementById('inp-strategicValue').value),
    criticality:    Number(document.getElementById('inp-criticality').value),
    innovation:     Number(document.getElementById('inp-innovation').value),
    techDebt:       Number(document.getElementById('inp-techDebt').value)
  };

  processes.push(newProcess);
  renderAll();
  event.target.reset(); // очищаем форму
}

// удаление через делегирование событий
// вешаем обработчик на tbody, а не на каждую кнопку
function handleDelete(event) {
  if (event.target.classList.contains('btn-delete')) {
    var id = Number(event.target.getAttribute('data-id'));

    // оставляем всё кроме удаляемого
    processes = processes.filter(function(p) {
      return p.id !== id;
    });

    renderAll();
  }
}


// localStorage - сохраняем данные в браузере
function saveToStorage() {
  localStorage.setItem('surveyMatrix', JSON.stringify(processes));
}

function loadFromStorage() {
  var data = localStorage.getItem('surveyMatrix');
  if (data) {
    processes = JSON.parse(data);
  }
}

// сброс к начальным данным
function resetData() {
  if (confirm('Сбросить все данные к начальным?')) {
    // создаём копии объектов чтобы не менять оригинал
    processes = initialProcesses.map(function(p) {
      return Object.assign({}, p);
    });
    activeFilter = 'all';
    document.getElementById('zone-filter').value = 'all';
    renderAll();
  }
}

// экспорт в json файл
function exportJSON() {
  var exportData = processes.map(function(p) {
    return {
      name: p.name,
      type: p.type,
      operationalAvg: calcOperational(p).toFixed(2),
      strategicAvg: calcStrategic(p).toFixed(2),
      zone: getZone(p)
    };
  });

  var json = JSON.stringify(exportData, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);

  var link = document.createElement('a');
  link.href = url;
  link.download = 'survey-matrix.json';
  link.click();

  URL.revokeObjectURL(url);
}


// запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  loadFromStorage();

  document.getElementById('process-form').addEventListener('submit', handleAddProcess);
  document.getElementById('table-body').addEventListener('click', handleDelete);

  renderAll();
});
