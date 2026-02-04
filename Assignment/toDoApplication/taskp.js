const scores=["85",92,"67",40,100,"30",76,"90"];
const analyzeScores=function(scores){
    let excellentCount=0;
    let passCount=0;
    let failCount=0;
    let totalStudents=0;
    let averageScore=0;

    for(let i=0;i<scores.length-1;i++){
        let tempScore=Number(scores[i])
        if(scores[i]==isNaN()){
            continue;
        }
        totalStudents++;
        averageScore+=tempScore;
       
    }
}

console.log(analyzeScores);