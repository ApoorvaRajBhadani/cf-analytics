var problems = new Map();
var ratings = new Map();
var tags = new Map();
var ratingChartLabel = [];
var ratingChartData = [];
var ratingChartBackgroundColor = [];
var tagChartLabel = [];
var tagChartData = [];
var rating_min = -1;
var rating_max = -1;
var date_min = -1;
var date_max = -1;

chrome.storage.sync.get(["ratingMin", "ratingMax", "dateMin", "dateMax", "useRatingMin", "useRatingMax", "useDateMin", "useDateMax"], data => {
  if (data.ratingMin != "undefined" && data.useRatingMin) rating_min = data.ratingMin;
  if (data.ratingMax != "undefined" && data.useRatingMax) rating_max = data.ratingMax;
  if (data.dateMin != "undefined" && data.useDateMin) date_min = data.dateMin;
  if (data.dateMax != "undefined" && data.useDateMax) date_max = data.dateMax;
});

ratings[Symbol.iterator] = function* () {
  yield* [...ratings.entries()].sort((a, b) =>{
    if(a[0]<b[0]){
      return -1;
    }else if(a[0]>b[0]){
      return 1;
    }else return 0;
  } );
}
tags[Symbol.iterator] = function* () {
  yield* [...tags.entries()].sort((a, b) =>{
    if(a[1]<b[1]){
      return 1;
    }else if(a[1]>b[1]){
      return -1;
    }else return 0;
  } );
}
//Material Design 400 light
const colorArray = ['#ff867c','#ff77a9','#df78ef','#b085f5','#8e99f3','#80d6ff','#73e8ff','#6ff9ff','#64d8cb','#98ee99','#cfff95','#ffff89','#ffff8b','#fffd61','#ffd95b','#ffa270'];
chrome.runtime.sendMessage({todo:"appendHTML"},function(response){
    $('#pageContent').append(response.htmlResponse);

    if (rating_min != -1 || rating_max != -1) $("#ratingLi").show();
    if (date_min != -1 || date_max != -1) $("#dateLi").show();

    if (rating_min != -1){
      $("#ratingMinSpan").text(rating_min);
      $("#ratingMinSpan").addClass(ratingSpanColor(rating_min));
      $("#ratingMinSpan").css("font-weight","bold");
    }
    if (rating_max != -1){
      $("#ratingMaxSpan").text(rating_max);
      $("#ratingMaxSpan").addClass(ratingSpanColor(rating_max));
      $("#ratingMaxSpan").css("font-weight","bold");
    }
    if (date_min != -1) $("#dateMinSpan").text(timeToDate(date_min));
    if (date_max != -1) $("#dateMaxSpan").text(timeToDate(date_max));
   
    const profileId = getProfileIdFromUrl(window.location.href);
    $.get(`https://codeforces.com/api/user.status?handle=${profileId}`,function(data){
      if(data.status == "OK"){
        //processdata
        processData(data.result);
        createProblemRatingChart();
        createTagChart();
      }else{
        //response not loaded
        console.error(data.status + ' : ' + data.comment);
      }
    })
});
function getProfileIdFromUrl(url){
  var arr = url.split("/");
  var temp = arr.slice(-1);
  temp = temp[0].split('?',1);
  return temp;
}
function processData(resultArr){
  for(var i = resultArr.length-1;i>=0;i--){
    var sub = resultArr[i];
    var problemId = sub.problem.contestId+'-'+sub.problem.index;
    if(!problems.has(problemId)){
      problems.set(problemId,{
        solved: false,
        use: false,
        rating: sub.problem.rating,
        contestId: sub.problem.contestId,
        index: sub.problem.index,
        tags: sub.problem.tags,
        date: sub.creationTimeSeconds
      });
    }
    let obj = problems.get(problemId);
    
    if (obj.rating && 
       (obj.rating >= rating_min || rating_min == -1) &&
       (obj.rating <= rating_max || rating_max == -1) && 
       (obj.date >= date_min || date_min == -1) && 
       (obj.date < date_max || date_max == -1))
      obj.use = true;
      
    if(sub.verdict=="OK")
      obj.solved = true;
    
      problems.set(problemId,obj);
  }
  let unsolvedCount = 0;
  problems.forEach(function(prob){
    if (prob.use){
      if(prob.rating && prob.solved===true){
        if(!ratings.has(prob.rating)){
          ratings.set(prob.rating,0);
        }
        let cnt = ratings.get(prob.rating);
        cnt++;
        ratings.set(prob.rating,cnt);
      }
      if(prob.solved===false){
        unsolvedCount++;
        const problemURL = findProblemURL(prob.contestId,prob.index);
        $('#unsolved_list').append(`
            <a class="unsolved_problem" href="${problemURL}">
              ${prob.contestId}-${prob.index}
            </a>
        `);
        $('#unsolved_list').append("     ");
      }
      if(prob.solved===true){
        prob.tags.forEach(function(tag){
          if(!tags.has(tag)){
            tags.set(tag,0);
          }
          let cnt = tags.get(tag);
          cnt++;
          tags.set(tag,cnt);
        })
      }
    }
  })
  $('#unsolved_count').text(`Count : ${unsolvedCount}`);
  for(let[key,val] of ratings){
    ratingChartLabel.push(key);
    ratingChartData.push(val);
    ratingChartBackgroundColor.push(ratingBackgroundColor(key));
  }
  for(let[key,val] of tags){
    tagChartLabel.push(key);
    tagChartData.push(val);
  }
}
function findProblemURL(contestId,index){
  if(contestId && contestId.toString().length<=4){
    return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  }else{
    return `https://codeforces.com/problemset/gymProblem/${contestId}/${index}`;
  }
}
function createProblemRatingChart(){
  var ctx = document.getElementById('problemRatingChart').getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ratingChartLabel,
          datasets: [{
              label: 'Problems Solved',
              data: ratingChartData,
              backgroundColor: ratingChartBackgroundColor,
              borderColor: 'rgba(0  ,0  ,0  ,1)',//ratingChartBorderColor,
              borderWidth: 0.75,
          }]
      },
      options: {
          aspectRatio : 2.5,
          scales: {
            x: {
              title:{
                text: 'Problem Rating',
                display: false,
              }
            },
            y: {
                title:{
                  text: 'Problems Solved',
                  display: false,
                },
                beginAtZero: true
            }
          },
          onClick: function (event, legendItem) {
            if (legendItem.length > 0) {
                const ratingChartIndex = legendItem[0].index;
                const ratingLevel = ratingChartLabel[ratingChartIndex];
                const url = `https://codeforces.com/problemset?tags=${ratingLevel}-${ratingLevel}`;
                window.location.href = url;
            }
          }
      }
  });
}
function createTagChart(){
  var ctx = document.getElementById('tagChart').getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: tagChartLabel,
          datasets: [{
              label: 'Tags Solved',
              data: tagChartData,
              backgroundColor: colorArray,
              // borderColor: 'rgba(0,0,0,0.5)',//ratingChartBorderColor,
              borderWidth: 0.5,
              // spacing: 5,
          }]
      },
      options: {
        aspectRatio : 2,
        plugins: {
          legend: {
              display: false,
              position: 'right',
          },
        },
        onClick: function (event, legendItem) {
          if (legendItem.length > 0) {
              const tagChartIndex = legendItem[0].index;
              const tag = tagChartLabel[tagChartIndex];
              const url = `https://codeforces.com/problemset?tags=${tag}`;
              window.location.href = url;
          }
        }
      },
  });
  for(var i=0;i<tagChartLabel.length;i++){
    $('#legend_unordered_list').append(`<li>
    <svg width="12" height="12">
      <rect width="12" height="12" style="fill:${colorArray[i % (colorArray.length)]};stroke-width:1;stroke:rgb(0,0,0)" />
    </svg>
    ${tagChartLabel[i]} : ${tagChartData[i]}
    </li>`)
  }
}
function ratingBackgroundColor(rating){
  const legendaryGrandmaster      = 'rgba(170,0  ,0  ,0.9)';
  const internationalGrandmaster  = 'rgba(255,51 ,51 ,0.9)';
  const grandmaster               = 'rgba(255,119,119,0.9)';
  const internationalMaster       = 'rgba(255,187,85 ,0.9)';
  const master                    = 'rgba(255,204,136,0.9)';
  const candidateMaster           = 'rgba(255,136,255,0.9)';
  const expert                    = 'rgba(170,170,255,0.9)';
  const specialist                = 'rgba(119,221,187,0.9)';
  const pupil                     = 'rgba(119,255,119,0.9)';
  const newbie                    = 'rgba(204,204,204,0.9)';
  if(rating>=3000){
    return legendaryGrandmaster;
  }else if(rating>=2600 && rating<=2999){
    return internationalGrandmaster;
  }else if(rating>=2400 && rating<=2599){
    return grandmaster;
  }else if(rating>=2300 && rating<=2399){
    return internationalMaster;
  }else if(rating>=2100 && rating<=2299){
    return master;
  }else if(rating>=1900 && rating<=2099){
    return candidateMaster;
  }else if(rating>=1600 && rating<=1899){
    return expert;
  }else if(rating>=1400 && rating<=1599){
    return specialist;
  }else if(rating>=1200 && rating<=1399){
    return pupil;
  }else{
    return newbie;
  }
}
function ratingSpanColor(rating){
  const red    = 'user-red';
  const orange = 'user-orange';
  const violet = 'user-violet';
  const blue   = 'user-blue';
  const cyan   = 'user-cyan';
  const green  = 'user-green';
  const gray   = 'user-gray';
  
  if(rating>=2400)
    return red;
  else if(rating>=2100 && rating<=2399)
    return orange;
  else if(rating>=1900 && rating<=2099)
    return violet;
  else if(rating>=1600 && rating<=1899)
    return blue;
  else if(rating>=1400 && rating<=1599)
    return cyan;
  else if(rating>=1200 && rating<=1399)
    return green;
  else
    return gray; 
}