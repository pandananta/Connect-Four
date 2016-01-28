
(function($){
	var RUBRIC = [],
		BOARDWIDTH = 7,
		BOARDHEIGHT = 6,
		BOARD = [],
		BLACK = 0, 
		RED = 1,
		SCORECARDS = {},
		columnHeight = [],
		player = BLACK,
		gameOver = false;

	var generateRubric = function () {
		//for every cell, find all winning paths in every direction
		for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
			var vertical = directionalRubric(i, BOARDWIDTH), 
				horizontal = directionalRubric(i, 1),
				diagonalUp = directionalRubric(i, BOARDWIDTH+1),
				diagonalDown = directionalRubric(i, BOARDWIDTH-1);

			RUBRIC[i] = $.merge( $.merge( $.merge( vertical, horizontal ), diagonalUp ), diagonalDown);
		}
	}

	var directionalRubric = function (cellNum, offset) {
		//some of these cell combinations won't exist, but that is okay for our use case. 
		//in v2, it would be good to return only real paths + allow for variable winning path size e.g. 5 in a row
		var dr = [];
		dr.push([cellNum, cellNum + offset, cellNum + 2*offset, cellNum + 3*offset]);
		dr.push([cellNum - offset, cellNum, cellNum + offset, cellNum + 2*offset]);
		dr.push([cellNum - 2*offset, cellNum - offset, cellNum, cellNum + offset]);
		dr.push([cellNum - 3*offset, cellNum - 2*offset, cellNum - offset, cellNum]);
		return dr;
	}

	var hasWinningPath = function (cellNum, cellList) {
		console.log(cellList);
		$.each( RUBRIC[cellNum], function( index, path ) {
		 	$.each( path, function( i, cell ) {
		 		console.log(cell);
		     	if($.inArray(cell, cellList) == -1) return false;
		     	if (i == path.length-1) {
					console.log("OMGGGGGGG YOU WON");
					gameOver = true;
				}
		     	return true;
		  	});
		});
		return false;
	}

	var initialize = function() {
		var $newRow = $('<div class="row">'),
			$newCell;
		SCORECARDS[BLACK] = [];
		SCORECARDS[RED] = [];
		$('.board').empty();
		for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
			BOARD[i] = -1;
			$newCell = $('<div class="cell">');
			$newCell.attr('data-cell', i);
			if (i < BOARDWIDTH) {
	        	$newCell.addClass('selectable');
	        	columnHeight[i] = 0;
	        }
			$newCell.on('click', function(e) {
	        	var node = $(e.target)
	        		cellNum = $(e.target).data("cell"), 
	        		rowNum = Math.floor(cellNum/BOARDWIDTH),
	        		colNum = cellNum%BOARDWIDTH;

	        		console.log(rowNum, colNum);

        		if (!gameOver && columnHeight[colNum] == rowNum) {
        			node.addClass(player ? 'red' : 'black').removeClass('selectable');
        			SCORECARDS[player].push(cellNum);
        			columnHeight[colNum] += 1;

        			if (SCORECARDS[player].length > 3) {
        				if (hasWinningPath(cellNum, SCORECARDS[player])) {
        					console.log("OMGGGGGGG YOU WON");
        				}
        			}

        			$('[data-cell=' + (cellNum + BOARDWIDTH) + ']').addClass('selectable');
        			player = 1 - player;
        		}
	        });
	        $newRow.append($newCell);
	        if (i%BOARDWIDTH === BOARDWIDTH-1)  {
        		$('.board').prepend($newRow);
        		$newRow = $('<div class="row">');
	        }
		}
	    
	};

	$('.restart').on('click', initialize);

	generateRubric();
	initialize();
})(jQuery)



