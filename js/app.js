document.addEventListener('DOMContentLoaded', function init() {
	const crossword_data = get_data();
	const box_size = 50;
	const container = document.querySelector('#container');
	const height = container.clientHeight;
	const width = container.clientWidth;
	const h_rows = Math.floor(height / box_size);
	const h_cols = Math.floor(width / box_size);

	const game_state_of_truth = [];
	const current_board = Array.from(new Array(h_rows), () => Array.from(new Array(h_cols), () => ''));

	crossword_data.then((data) => {
		game_began({ crossword_data: data, game_state_of_truth, h_rows, h_cols, current_board })
	});

	create_empty_grid({ h_rows, h_cols, container, box_size });
	event_listners({ container, current_board });
});

function event_listners({ container, current_board }) {
	container.addEventListener('keypress', (e) => {
		if (e.target.nodeName == 'TD') {
			e.preventDefault();
			if (e.which >= 65 && e.which <= 122) {
				const rc = e.target.querySelector('span').innerText;
				const span = document.createElement('span');
				span.innerText = rc;
				span.contentEditable = false;
				e.target.innerText = e.key;
				e.target.appendChild(span);
				let row_pos = +[...e.target.parentElement.parentElement.children].indexOf(e.target.parentElement);
				let col_pos = +[...e.target.parentElement.children].indexOf(e.target);
				current_board[row_pos][col_pos] = e.key;
			}
		}
	});
}

function create_empty_grid({ h_rows, h_cols, container, box_size }) {
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');

	for (let row = 0; row < h_rows; row++) {
		const tr = document.createElement('tr');
		for (let column = 0; column < h_cols; column++) {
			const td = document.createElement('td');
			td.contentEditable = true;
			let span = document.createElement('span');
			span.contentEditable = false;
			span.textContent = (row) + ', ' + (column);
			td.appendChild(span);
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}

	table.appendChild(tbody);
	container.appendChild(table);
}

function get_data() {
	localforage.setDriver([localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE]);

	return localforage.getItem('crossword_data').then(function getting_data(crossword_data) {
		if (crossword_data == null) {
			return fetch('js/data.json')
				.then((response) => {
					return response.json();
				})
				.then((json) => {
					localforage.setItem('crossword_data', json).then(function putting_data() {
					});
					return json;
				})
				.catch((e) => {
					console.log(e);
				});
		} else {
			return new Promise((resolve, reject) => {
				resolve(crossword_data);
				reject('Data not found');
			});
		}
	});
}

function game_began({ crossword_data, game_state_of_truth, h_rows, h_cols, current_board }) {
	const index = Math.floor(Math.random() * crossword_data.length);
	const puzzle = crossword_data.splice(index, 1)[0];

	if (puzzle.answer.length <= h_rows || puzzle.answer.length <= h_cols) {
		return put_puzzle({ puzzle, game_state_of_truth, h_rows, h_cols, current_board });
	} else {
		game_began({ crossword_data, game_state_of_truth, h_rows, h_cols, current_board });
	}
}

function put_puzzle({ puzzle, game_state_of_truth, h_rows, h_cols, current_board }) {
	if (!(puzzle.answer.length <= h_rows)) {
		return find_vertical_space({ puzzle, game_state_of_truth, current_board });
	}

	if (!(puzzle.answer.length <= h_cols)) {
		return find_horizontal_space({ puzzle, game_state_of_truth, current_board });
	}

	if (Math.random() > 0.5) {
		return find_horizontal_space({ puzzle, game_state_of_truth, current_board });
	} else {
		return find_vertical_space({ puzzle, game_state_of_truth, current_board });
	}
}

function find_vertical_space({ puzzle, game_state_of_truth, current_board }) {
	const available_slots = [];
	let row_len = current_board.length - 1;
	let col_len = current_board[0].length - 1;

	for (let col = 0; col <= col_len; col++) {
		let obj = {
			r1: null,
			c1: null,
			r2: null,
			c2: null
		};
		for (let row = 0; row <= row_len; row++) {
			if (row == row_len || current_board[row][col] != '') {
				if (row_len == row) {
					obj.r2 = row;
					obj.c2 = col;
				}
				available_slots.push({ ...obj });
				obj = {
					r1: null,
					c1: null,
					r2: null,
					c2: null
				};
			} else if (current_board[row][col] == '') {
				if (obj.r1 == null && obj.c1 == null) {
					obj.r1 = obj.r2 = row;
					obj.c1 = obj.c2 = col;
				} else {
					obj.r2 = row;
					obj.c2 = col;
				}
			}
		}
	}
}

function find_horizontal_space({ puzzle, game_state_of_truth, current_board }) {
	console.log('find_horizontal_space');
}