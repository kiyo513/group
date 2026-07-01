const members = [];

const memberList = document.getElementById("memberList");

document.getElementById("addBtn").onclick = () => {

    const name = document.getElementById("name").value.trim();
    const attr = document.getElementById("attr").value.trim();

    if(name.length < 1 || name.length > 50){
        alert("名前は1～50文字");
        return;
    }

    members.push({
        name,
        attr
    });

    document.getElementById("name").value="";
    document.getElementById("attr").value="";

    refreshList();
};

function refreshList(){

    memberList.innerHTML="";

    members.forEach((m,i)=>{

        const li=document.createElement("li");
        li.innerHTML=
            `${m.name}（${m.attr}）
             <button onclick="removeMember(${i})">削除</button>`;
        memberList.appendChild(li);

    });

}

function removeMember(i){
    members.splice(i,1);
    refreshList();
}

document.getElementById("divideBtn").onclick=()=>{

    const groupCount=parseInt(document.getElementById("groupCount").value);

    if(groupCount<1){
        alert("グループ数を入力してください");
        return;
    }

    if(members.length===0){
        alert("メンバーがいません");
        return;
    }

    const groups=[];

    for(let i=0;i<groupCount;i++){
        groups.push({
            members:[],
            attrCount:{}
        });
    }

    // 属性ごとにまとめる
    const attrMap={};

    members.forEach(m=>{

        if(!attrMap[m.attr]){
            attrMap[m.attr]=[];
        }

        attrMap[m.attr].push(m);

    });

    // ランダム化
    Object.values(attrMap).forEach(list=>{
        shuffle(list);
    });

    // 人数が多い属性順
    const attrs=Object.keys(attrMap).sort((a,b)=>attrMap[b].length-attrMap[a].length);

    attrs.forEach(attr=>{

        attrMap[attr].forEach(member=>{

            let bestGroup=null;
            let bestScore=999999;

            groups.forEach(g=>{

                const same=g.attrCount[attr]||0;

                const score=
                    same*1000+
                    g.members.length;

                if(score<bestScore){

                    bestScore=score;
                    bestGroup=g;

                }

            });

            bestGroup.members.push(member);

            bestGroup.attrCount[attr]=(bestGroup.attrCount[attr]||0)+1;

        });

    });

    showResult(groups);

};

function showResult(groups){

    const result=document.getElementById("result");

    result.innerHTML="";

    groups.forEach((g,index)=>{

        const div=document.createElement("div");

        div.className="group";

        let html=`<h2>グループ${index+1}</h2>`;

        g.members.forEach(m=>{

            html+=`<div class="member">${m.name}</div>`;

        });

        html+=`<div class="summary">人数：${g.members.length}</div>`;

        div.innerHTML=html;

        result.appendChild(div);

    });

}

function shuffle(array){

    for(let i=array.length-1;i>0;i--){

        const j=Math.floor(Math.random()*(i+1));

        [array[i],array[j]]=[array[j],array[i]];

    }

}

document.getElementById("defaultBtn").onclick = async () => {

    try{

        const response = await fetch("default.csv");

        if(!response.ok){
            throw new Error();
        }

        const text = await response.text();

        members.length = 0;

        text.split(/\r?\n/).forEach(line=>{

            if(line.trim()==="") return;

            const cols=line.split(",");

            members.push({
                name: cols[0].trim(),
                attr: (cols[1]||"").trim()
            });

        });

        refreshList();

    }catch(e){

        alert("default.csv を読み込めませんでした。");

    }

};
