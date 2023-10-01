function load(){
  reset();

  chrome.storage.sync.get(["ratingMin", "ratingMax", "dateMin", "dateMax", "useRatingMin", "useRatingMax", "useDateMin", "useDateMax"], data => {
    if (data.ratingMin != "undefined" && data.useRatingMin){
      $("#ratingMinSpan").text(data.ratingMin);
      $("#ratingMin").val(data.ratingMin);
    }
    if (data.ratingMax != "undefined" && data.useRatingMax){
      $("#ratingMaxSpan").text(data.ratingMax);
      $("#ratingMax").val(data.ratingMax);
    }
    if (data.dateMin != "undefined" && data.useDateMin){
      $("#dateMinSpan").text(timeToDate(data.dateMin));
      $("#dateMin").val(timeToDate(data.dateMin));
    }
    if (data.dateMax != "undefined" && data.useDateMax){
      $("#dateMaxSpan").text(timeToDate(data.dateMax));
      $("#dateMax").val(timeToDate(data.dateMax));
    }
  });

}

function update(){
  const newRatingMin = $("#ratingMin").val();
  const newRatingMax = $("#ratingMax").val();
  const newDateMin = $("#dateMin").val();
  const newDateMax = $("#dateMax").val();

  chrome.storage.sync.set({
    ratingMin: newRatingMin,
    ratingMax: newRatingMax,
    dateMin: dateToTime(newDateMin),
    dateMax: dateToTime(newDateMax),
    useRatingMin: (newRatingMin != ""),
    useRatingMax: (newRatingMax != ""),
    useDateMin: (newDateMin != ""),
    useDateMax: (newDateMax != "")
  });

  load();
}

function reset(update = false){ // update the saved data as well or just the ui
  if (update){
    chrome.storage.sync.set({ 
      ratingMin: -1,
      ratingMax: -1,
      dateMin: -1,
      dateMax: -1,
      useRatingMin: false,
      useRatingMax: false,
      useDateMin: false,
      useDateMax: false
    });
  }

  $("#ratingMinSpan").text("min");
  $("#ratingMaxSpan").text("max");
  $("#dateMinSpan").text("oldest");
  $("#dateMaxSpan").text("newest");
  $("input[type=number], input[type=date]").val("");
}

$(document).ready(function(){
  load();

  $("#update").click(() => {
    update();
  });

  $("#reset").click(() => {
    reset(true);
  });

  $('body').on('click', 'a', function(){
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
  });
});