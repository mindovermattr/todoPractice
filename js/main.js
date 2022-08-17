const dom ={
    taskNames: document.getElementById("task-names"),
    input: document.getElementById("newTask"),
    addBtn: document.getElementById("add"),
    redact: document.getElementById("redact"), /* кнопка Edit */
    change: document.querySelector(".app__task-change"),
    statusbar:document.getElementById("status"),
    remove: document.getElementById("remove"),
    redactElements:{
        changeBtn: document.getElementById("changeButton"),
        changeInput: document.getElementById("changeTask")
    },

};

let dots=[];
let userStatus="";

/* Массив задач */
const tasks =[];


dom.addBtn.addEventListener("click", addTask);

document.body.addEventListener("keydown", (key)=>key.key==="Enter"? addTask():0);

function dotAnim(dots,context){
    dom.statusbar.firstChild.textContent=context
    let timerId = setInterval(()=>{
        dots.push(".");
        dots.length>3 ? dots.splice(-5,4):0;
        dom.statusbar.firstChild.textContent=context+dots.join("");
        console.log(dots);
    },1200)
    return timerId
}

/* Добавление таска*/
function addTask(){
    const taskBlock = dom.taskNames;
    const userInput = dom.input.value;

    if(checkInputText(userInput,tasks)){
        const id = new Date().getTime()
        tasks.push({
            id,
            text:userInput,
            isComplete:false,
            status: "",
        })
        renderTasks(tasks);
        dom.input.value="";
        dom.input.placeholder="Добавлено!"
    }else{
        dom.input.value="";
        dom.input.placeholder="Такая задача уже существует"
    }
}

/* Проверка на похожий инпут/пустоту */
function checkInputText(name, tasks){
    if(name && !tasks.some(obj => obj.text == name)){
        return true
    }else{
        return false
    }
}

/* Отрисовка  */
function renderTasks(tasks){
    let html=""
    tasks.forEach(elem=>{
       let id=elem.id;
       let deleting = elem.status=="deleting" ? "":"d-none"
       let completed = elem.isComplete ? "task__complete" : "";
       html += `
       <div class="task ${elem.status}" id=${id}>
            <label class="d-none">
                <input type="checkbox" class="task-checkbox">
            </label>
            <span class="task-name">${elem.text}</span>
            <span class="delete-button ${deleting}">X</span>
        </div>`
    })
    dom.taskNames.innerHTML=html;
}


/* Редактирование */ //////////////

dom.redact.addEventListener("click",redact);
let timer;
function redact (){
    if(userStatus==="deleting") {
        dom.statusbar.firstChild.textContent="Выйдите из режима удаления"
        return 0
    };
    let heading = document.querySelector(".app__status");
    const add = dom.addBtn;
    const change = dom.change;
    if(!heading.classList.toggle("d-none")){
        add.parentNode.classList.toggle("d-none");
        change.classList.toggle("d-none")
        changeStatus("redacting",tasks);
        timer=dotAnim(dots,"redacting");
        console.log(timer);
    }else{
        changeStatus("",tasks)
        change.classList.toggle("d-none");
        add.parentNode.classList.toggle("d-none");
        console.log(timer);
        clearInterval(timer);
        dots.splice(0,3);
        return
    }
    chooseRedactTask();
    /* userStatus=""; */
}

/* Проверка на редактирование более 1 элемента */

function checkRedacting(allTasks){
    let result = 0;
    allTasks.forEach(elem=>{
        if(elem.classList.contains("redacting--active")){ 
            result+=1;
        }
    })
    console.log(result);
    return result < 1 ? true:false;
}

/* Выбор редактируемой таски */
function chooseRedactTask(){
    let allTasks = document.querySelectorAll(".task");
    var currentActiveElemId = 0;

    allTasks.forEach(elem=>elem.addEventListener("click", ()=>{
        currentActiveElemId = elem.getAttribute("id")
        if(elem.classList.contains("redacting--active")){
            currentActiveElemId=null;
            elem.classList.toggle("redacting--active");
        }else if(checkRedacting(allTasks, currentActiveElemId)){
            currentActiveElemId = elem.getAttribute("id");
            elem.classList.toggle("redacting--active");
            changeTaskName(tasks, currentActiveElemId);
        }
        else{
            dom.statusbar.firstChild.textContent='Активная задача уже выбрана';
        }


    }))
  
};
/* Изменение выбранной таски */
function changeTaskName(tasks, choosenTaskId){
    const changeButton = dom.redactElements.changeBtn;
    const controller= new AbortController();
    changeButton.addEventListener("click", ()=>{
        let userInput=dom.redactElements.changeInput.value;
        tasks.forEach(task=>{
            console.log(choosenTaskId);
        if(task.id==choosenTaskId && checkInputText(userInput,tasks)){
        task.text=userInput
        dom.redactElements.changeInput.placeholder="Успешно изменено";
        }
        })
        renderTasks(tasks);
        dom.statusbar.firstChild.textContent='redacting...';
        dom.redactElements.changeInput.value="";
        controller.abort();
        chooseRedactTask();
    }, {signal:controller.signal});
    
    
}
/* Редактирование */ /////////////////

/* Удаление */ ///
dom.remove.addEventListener("click",deleting)

function deleting(){
if(userStatus==="redacting") {
    dom.statusbar.firstChild.textContent="Выйдите из редактирования"
    return};

    
    let heading = document.querySelector(".app__status");

    if(!heading.classList.toggle("d-none")){
        changeStatus("deleting",tasks);
        timer=dotAnim(dots,"deleting")
        dom.addBtn.classList.toggle("d-none")
        dom.input.classList.toggle("d-none")
    }else{
        changeStatus("",tasks)
        dom.addBtn.classList.toggle("d-none")
        dom.input.classList.toggle("d-none")
        clearInterval(timer);
        dots.splice(0,3);
        return
    }

    deleteTask()
}

function deleteTask(){
    let deleteBtns=document.querySelectorAll(".delete-button");
    deleteBtns.forEach(btn=>{
        btn.addEventListener("click", ()=>{
            let index;
            let taskId=btn.parentNode.getAttribute("id");
            tasks.forEach((task,idx)=>{
                if(task.id===taskId) index=idx;
            })
            tasks.splice(index,1)
            renderTasks(tasks);
            deleteTask();
        })
    })
}

/* Изменение статуса (Варианты: redacting/deleting,"") */
function changeStatus (status,tasks){
    userStatus=status
        tasks.forEach(task=>{
            task.status=userStatus;
        });
        renderTasks(tasks);
}
