
(function($){
	var BOARDWIDTH = 7,
		BOARDHEIGHT = 6,
		BOARD = [],
		BLACK = 0, 
		RED = 1,
		columnHeight = [],
		player = BLACK;

	var initialize = function() {
		var $newRow,
			$newCell;
		$('.board').empty();
		for (var row = 0; row < BOARDHEIGHT; row++) {
			$newRow = $('<div class="row">');
		    BOARD[row] = [];    
		    for (var col = 0; col < BOARDWIDTH; col++) { 
		        BOARD[row][col] = -1; 
		        $newCell = $('<div class="cell">')
		        $newCell.attr('data-column', col);
		        $newCell.attr('data-row', row);
		        $newCell.on('click', function(e) {
		        	var node = $(e.target)
		        		rowNum = $(e.target).data("row"),
		        		colNum = $(e.target).data("column");

	        		if (columnHeight[colNum] == rowNum) {
	        			node.addClass(player ? 'red' : 'black');
	        			columnHeight[colNum] += 1;
	        			$('[data-column='+ colNum +'][data-row='+ (rowNum +1) +']').addClass('selectable');
	        			player = 1 - player;
	        		}
		        });
		        if (row == 0) {
		        	$newRow.addClass('selectable');
		        }
		        $newRow.append($newCell); 
		   		columnHeight[col] = 0;
		    }
		    $('.board').prepend($newRow);
		}	
	};

	$('.restart').on('click', initialize);

	initialize();
})(jQuery)



