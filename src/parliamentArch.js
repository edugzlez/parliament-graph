/**
 * Built by David Richfield, Mathis Rade, Ranjith Siji and Ambady Anand S.
 * Code licensed under GPL v2.
 * https://parliamentdiagram.toolforge.org/parlitest.php
 * Code in Javascript by Eduardo González.
 */

const TOTALS = [
    3,
    15,
    33,
    61,
    95,
    138,
    189,
    247,
    313,
    388,
    469,
    559,
    657,
    762,
    876,
    997,
    1126,
    1263,
    1408,
    1560,
    1722,
    1889,
    2066,
    2250,
    2442,
    2641,
    2850,
    3064,
    3289,
    3519,
    3759,
    4005,
    4261,
    4522,
    4794,
    5071,
    5358,
    5652,
    5953,
    6263,
    6581,
    6906,
    7239,
    7581,
    7929,
    8287,
    8650,
    9024,
    9404,
    9793,
    10187,
    10594,
    11003,
    11425,
    11850,
    12288,
    12729,
    13183,
    13638,
    14109,
    14580,
    15066,
    15553,
    16055,
    16557,
    17075,
    17592,
    18126,
    18660,
    19208,
    19758,
    20323,
    20888,
    21468,
    22050,
    22645,
    23243,
    23853,
    24467,
    25094,
    25723,
    26364,
    27011,
    27667,
    28329,
    29001,
    29679,
    30367,
    31061
];

function scaleTo(ctx, w, h) {
    const scaleW = w / 360;
    const scaleH = h / 185;
    ctx.scale(scaleW, scaleH);
}

export function drawParliament(id, party_list, w = 360, h = null, fillStyle = 'black', font = '36px "Rubik SemiBold"') {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    if (h === null) h = w * 185 / 360;
    canvas.setAttribute("width", w);
    canvas.setAttribute("height", h);
    scaleTo(ctx, w, h);
    const dense_rows = true;

    const totalSeats = party_list.map(value => {
        return value.seats
    }).reduce((a, b) => a + b);

    let nb_rows = get_number_of_rows(totalSeats);
    let radius = 0.4 / nb_rows;

    let pos_list = get_spots_center(totalSeats, nb_rows, radius, dense_rows);
    draw_arch(ctx, totalSeats, party_list, pos_list, radius, fillStyle, font);
}

function draw_arch(ctx, totalSeats, party_list, positions_list, radius, fillStyle = 'black', font = '36px "Rubik SemiBold"') {
    // Number of seats
    ctx.font = font;
    ctx.fillStyle = fillStyle;
    ctx.textAnchor = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(totalSeats.toString(), 185, 175);

    // Seats
    let drawn_spots = 0;
    for (let i = 0; i < party_list.length; i++) {
        const party_nb_seats = party_list[i].seats;
        const party_fill_color = party_list[i].color;
        for (let j = drawn_spots; j < drawn_spots + party_nb_seats; j++) {
            let x = 5.0 + 100.0 * positions_list[j][1];
            let y = 5.0 + 100.0 * (1.75 - positions_list[j][2]);
            let r = radius * 100.0;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = party_fill_color;
            ctx.fill();
        }
        drawn_spots += party_nb_seats;
    }
}

function get_number_of_rows(totalSeats) {
    for (let i = 0; i < TOTALS.length; i++) {
        if (TOTALS[i] >= totalSeats) {
            return i + 1;
        }
    }
}

function get_spots_center(totalSeats, nb_rows, spot_radius, dense_rows) {
    let discarded_rows;
    let diagram_fullness;

    if (dense_rows) {
        const opti = optimize_rows(totalSeats, nb_rows);
        discarded_rows = opti.discarded_rows;
        diagram_fullness = opti.diagram_fullness;
    } else {
        discarded_rows = 0;
        diagram_fullness = totalSeats / TOTALS[nb_rows - 1];
    }

    let positions = [];


    for (let i = 1 + discarded_rows; i < nb_rows; i++) {
        add_ith_row_spots(positions, nb_rows, i, spot_radius, diagram_fullness);
    }
    add_last_row_spots(positions, totalSeats, nb_rows, spot_radius);
    return positions.sort().reverse();
}

function optimize_rows(totalSeats, nb_rows) {
    let handled_spots = 0;
    let rows_needed = 0;
    let magic_number;
    let max_spot_in_row;
    let nb_useless_rows;
    let diagram_fullness;
    for (let i = nb_rows; i > 0; i--) {
        magic_number = 3.0 * nb_rows + 4.0 * i - 2.0;
        max_spot_in_row = Math.PI / (2 * Math.asin(2.0 / magic_number));
        handled_spots += Math.floor(max_spot_in_row);
        rows_needed += 1;
        if (handled_spots >= totalSeats) {
            nb_useless_rows = i - 1;
            diagram_fullness = totalSeats / handled_spots;
            return { discarded_rows: nb_useless_rows, diagram_fullness: diagram_fullness }
        }
    }
}

function add_ith_row_spots(spots_positions, nb_rows, i,
    spot_radius, diagram_fullness) {
    let magic_number = 3.0 * nb_rows + 4.0 * i - 2.0;
    let max_spot_in_row = Math.PI / (2 * Math.asin(2.0 / magic_number));

    let nb_spots_in_ith_row = Math.floor(diagram_fullness * max_spot_in_row);

    let ith_row_radius = magic_number / (4.0 * nb_rows)
    append_row_spots_positions(spots_positions, nb_spots_in_ith_row,
        spot_radius, ith_row_radius)
}

function append_row_spots_positions(spots_positions, nb_seats_to_place, spot_radius, row_radius) {
    let sin_r_rr = Math.sin(spot_radius / row_radius);
    let angle;
    for (let i = 0; i < nb_seats_to_place; i++) {
        if (nb_seats_to_place === 1) {
            angle = Math.PI / 2.0;
        } else {
            angle = i
                * (Math.PI - 2.0 * sin_r_rr)
                / (nb_seats_to_place - 1.0)
                + sin_r_rr;
        }
        spots_positions.push([
            angle,
            row_radius * Math.cos(angle) + 1.75,
            row_radius * Math.sin(angle)
        ]);
    }
}

function add_last_row_spots(spots_positions, nb_delegates, nb_rows, spot_radius) {
    let nb_leftover_seats = nb_delegates - spots_positions.length;
    let last_row_radius = (7.0 * nb_rows - 2.0) / (4.0 * nb_rows);
    append_row_spots_positions(spots_positions, nb_leftover_seats, spot_radius, last_row_radius)
}

export function drawParliamentSVG(id, party_list, theme = 'light', fillStyle = 'black', font = '36px "Rubik SemiBold"') {
    const w = 360;
    const h = w * 185 / 360;
    const svg = document.getElementById(id);
    svg.innerHTML = '';
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const totalSeats = party_list.map(value => value.seats).reduce((a, b) => a + b);

    let nb_rows = get_number_of_rows(totalSeats);
    let radius = 0.4 / nb_rows;

    let pos_list = get_spots_center(totalSeats, nb_rows, radius, true);

    drawSeats(svg, party_list, pos_list, radius);
    drawTotalSeats(svg, totalSeats, w, h, fillStyle, font);
}

function drawSeats(svg, party_list, positions_list, radius) {
    let drawn_spots = 0;
    for (let i = 0; i < party_list.length; i++) {
        const identifier = party_list[i].candidacy;
        const party_nb_seats = party_list[i].seats;
        const party_fill_color = party_list[i].color;
        for (let j = drawn_spots; j < drawn_spots + party_nb_seats; j++) {
            let x = 5.0 + 100.0 * positions_list[j][1];
            let y = 5.0 + 100.0 * (1.75 - positions_list[j][2]);
            let r = radius * 100.0;
            let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", r);
            circle.setAttribute("fill", party_fill_color);
            if (identifier !== undefined)
                circle.setAttribute("data-party", identifier);
            svg.appendChild(circle);
        }
        drawn_spots += party_nb_seats;
    }
}

function drawTotalSeats(svg, totalSeats, w, h, fillStyle, font) {
    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", w / 2);
    text.setAttribute("y", h * 0.9);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("font-size", "36px");
    text.textContent = totalSeats;
    svg.appendChild(text);
}

function printGraph(elid, parties) {
    totalSeats = 0;


    if (parties != null && parties.length > 0)
        drawParliament(elid, Object.values(parties), 1024)

}