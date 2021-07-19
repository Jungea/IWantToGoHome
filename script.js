var count = 0,
length = 0; // 레코드 번호, 전체 레코드 개수를 위한 전역 변수
var Doc; // XML 문서 DOM 복합 객체 참조를 위한 전역 변수

$(document).ready(function () {
    
    // $('.collapse').collapse('toggle')

    /*
     * canvas
     */
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext('2d');

    context.lineWidth = 12;  // 글자 굵기
    context.strokeStyle = "black";  // 글자색

    // 배경
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    //마우스 클릭 시작 좌표
    var startX = 0;
    var startY = 0;

    var painting = false;
    

    // 마우스 클릭 시작
    $("canvas").mousedown(function(e) {
        startX = e.offsetX; 
        startY = e.offsetY;
        painting = true;
    })

    // 마우스 클릭 끝
    $("canvas").mouseup(function(e) {
        painting = false;
    })

    // 마우스 클릭 중
    $("canvas").mousemove(function(e) {
        if(!painting) return;
      
        var currentX = e.offsetX;
        var currentY = e.offsetY;

        draw(currentX, currentY);

        startX = currentX; 
        startY = currentY;
    })

    function draw(currentX, currentY) {
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(currentX, currentY);
        context.stroke();
    }
    
    // 마우스 캔퍼스 영역 벗어남
    // $("canvas").mouseout(function(e){
    //     painting = false;
    // })

    
    /*
     * 버튼
     */

    // Clear 버튼 클릭
    $('#clearBtn').click(function() {
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
    })

    //Predict 버튼 클릭
    $('#predictBtn').click(function() {

        // canvas to png
        var imgDataUrl = canvas.toDataURL("image/png");

        $("#canvasimg").attr('src', imgDataUrl)

        
        // blob
        var blobBin = atob(imgDataUrl.split(',')[1]);	// base64 데이터 디코딩
        var array = [];
        for (var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        
        // formdata
        var file = new Blob([new Uint8Array(array)], {type: 'image/png'});	// Blob 생성
        var formdata = new FormData();	// formData 생성
        formdata.append("file", file);	// file data 추가

        // canvas 지우기
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();

        // 통신
        $.ajax({
            // url: "http://127.0.0.1:5000/mnist/predict",
            url: "https://home-mnist.herokuapp.com/mnist/predict",

            type: "post",
            data : formdata,
            dataType: "json",
            // timeout: 1000,
            processData : false,	// data 파라미터 강제 string 변환 방지!!
            contentType : false,	// application/x-www-form-urlencoded; 방지!!
        
            // 성공시
            success: function (response) {
                console.log("호출성공");

                // 결과표 지우기
                $('td').remove();
                $('.predict_column').removeClass('predict_column')

                dataList = response.result[0]
    
                for(i=0; i<dataList.length; i++)
                    $('.tr_result1').append('<td>'+dataList[i]+'</td>')


                //반올림
                round_dataList = dataList.map(e => Math.round(e))
                for(i=0; i<round_dataList.length; i++)
                    $('.tr_result2').append('<td>'+round_dataList[i]+'</td>')
                

                // 예측값
                max_value = Math.max(...round_dataList)
                predict_number = round_dataList.indexOf(max_value)
                $('#predict_number').text(predict_number)


                // 예측값 테이블에 표시
                $('#result_table thead th').eq(predict_number+1).addClass('predict_column')
                $('.tr_result1 td').eq(predict_number).addClass('predict_column')
                $('.tr_result2 td').eq(predict_number).addClass('predict_column')

            },

            // 실패시
            error: function () {
                console.error("호출실패");
                alert("호출실패")
            }
        });
    })
    
});