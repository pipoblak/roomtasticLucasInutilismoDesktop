var picker ;
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
var timerPing;
var timePong;
var ws;
var lastMessage="";
var defaultIp="192.168.1.200"
$( document ).ready(function() {
  $(".modal-color-picker").attr("style","opacity:1");
  $(".modal-color-picker").hide();
  $(".modal-metric").attr("style","opacity:1");
  $(".modal-metric").hide();
  $(".modal-setIp").attr("style","opacity:1");
  $(".modal-setIp").hide();
  $(".content").attr("style","opacity:1");
  $(".content").hide();


  picker = new CP(document.querySelector('#color-picker'),false);
  picker.on("change", function(color) {
      color =CP.HEX2RGB(color);
      if(ws.readyState==1){
        if($($(document).find(".element-chain")[0]).hasClass("selected")){
          var message1 = "@0&#R" + color[0] + "G" + color[1] + "B" + color[2] + "S0|";
          var message2 = "@1&#R" + color[0] + "G" + color[1] + "B" + color[2] + "S0|";
          ws.send(message1);
          ws.send(message2);
          sleep(250);
        }
        else{
          var message = "@" + $($(document).find(".element-menu-item.selected")[0]).attr("id")  + "&#R" + color[0] + "G" + color[1] + "B" + color[2] + "S" + $($(document).find(".element-menu-item.selected")[0]).attr("data-id") +  "|";
          if(message != lastMessage){
              ws.send(message);
              sleep(250);
              lastMessage=message;
          }


        }


      }

  });
  createWebsocketConnection();
  $('.modal-color-picker').on('click',function(event){
    $(event.target.closest("#modal-holder")).hide();
    picker.exit();
    if(ws.readyState==1){
      ws.send(lastMessage);
    }
  });
});



$('#btn-color-picker').on('click',function(event){
  $(".modal-color-picker").show();
  picker.enter();
  picker.fit();
});

$('.modal').on('click',function(event){
  event.stopPropagation();
});

$('#btn-effects').on('click',function(event){
  $(".modal-effects").show();
});

$('.menu-app-bar').on('click',function(event){
  $(".modal-metric").show();
});

$('.modal-metric').on('click',function(event){
  $(event.target.closest("#modal-holder")).hide();
});

$('.social-button').on('click',function(event){
  $(document).find(".social-button.selected").removeClass("selected");
  var target =   $(event.target).closest(".social-button");
  target.addClass("selected");
  var message = "@7&;" + target.attr("id") + "|";
  ws.send(message);
  lastMessage = message;
});

$('.action').on('click',function(event){
  var target =   $(event.target).closest(".action");
  if($($(document).find(".element-chain")[0]).hasClass("selected")){
    var message1="@0&;" + target.attr("id") + "S0|";
    var message2="@1&;" + target.attr("id") + "S0|";
    ws.send(message1);
    ws.send(message2);
  }
  else{
    var message = "@" + $($(document).find(".element-menu-item.selected")[0]).attr("id")  + "&;" + target.attr("id") + "S" + $($(document).find(".element-menu-item.selected")[0]).attr("data-id") +  "|";
    ws.send(message);
    lastMessage = message;
  }
});

$('.element-menu-item').on('click',function(event){
  $(document).find(".element-menu-item.selected").removeClass("selected");
  $(event.target).closest(".element-menu-item").addClass("selected");
  var currentImage=$(document).find(".current-element-image");
  currentImage.attr("src",$(event.target).attr("src"));
});

$('.element-chain').on('click',function(event){
  var target = $(event.target).closest(".element-chain") ;
  if(target.hasClass("selected")){
    target.removeClass("selected");
  }
  else{
    target.addClass("selected");
  }
});

$('.app-bar-logo').on('click',function(event){
  $(".modal-setIp").show();
  var currentIp = stash.get('ip');
  if(currentIp != undefined ){
    $("#ip1").val(currentIp.ip.ip1);
    $("#ip2").val(currentIp.ip.ip2);
    $("#ip3").val(currentIp.ip.ip3);
    $("#ip4").val(currentIp.ip.ip4);
  }
});

$('.modal-setIp').on('click',function(event){
  $(event.target.closest("#modal-holder")).hide();
});

$('.button-ip').on('click',function(event){
  stash.set('ip',new Object({ip:
      {ip1:$('#ip1').val(),
      ip2:$('#ip2').val(),
      ip3:$('#ip3').val(),
      ip4:$('#ip4').val()}}));
  createWebsocketConnection();

});

function createWebsocketConnection(){
  var ip = stash.get('ip');
  if(ip==undefined){
    ip = defaultIp;
  }
  else{
    ip = ip.ip.ip1 + "." +ip.ip.ip2 + "." +ip.ip.ip3 + "." +ip.ip.ip4;
  }
  ws = new WebSocket('ws://' + ip +':82');
  ws.onopen = function()
  {
    $(".loading").hide();
    $(".content").fadeIn();
     // Web Socket is connected, send data using send()
     ws.send("{'Device':{'name':'mobile','macAddress':'mobile','owner':'mobile'}}");
  };

  ws.onmessage = function (evt)
  {
     var received_msg = evt.data;
     if(received_msg=="Connected"){
       $(".loading").hide();
       $(".content").fadeIn();
     }
     else if(received_msg=="!"){
       ws.send("ping");
       timerPing= performance.now();
     }
     else if (received_msg=="pong") {
        timerPong= performance.now();
        console.log((timerPong-timerPing)+"ms");
     }
     //console.log(received_msg);
  };

  ws.onclose = function()
  {
     // websocket is closed.
     console.log("Connection is closed...");
  };
}
