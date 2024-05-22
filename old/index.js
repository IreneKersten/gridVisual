document.addEventListener("DOMContentLoaded", function() {

const container = d3.select("#svg-container");
const divElement = container.node();

// Verkrijg de breedte en hoogte van de div met behulp van clientWidth en clientHeight
 const width = divElement.clientWidth;
 const height = divElement.clientHeight;
// const width = "100%";
//  const height = "100%";

 const format = d3.format(",.0f");
//const linkColor = "source";
const linkColor = "chargeOrDischarge";

// // Define SVG dimensions
// const svgWidth = width - (2 * margin);
// const svgHheight = height - (2 * margin);

const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("color", "pink")
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

d3.csv("data2.csv").then(function(csvdata) {


    const sankey = d3.sankey()
        .nodeId(d => d.name)
        // .nodeAlign(d3[nodeAlign]) // d3.sankeyLeft, etc.
        .nodeWidth(15)  // Constructs and configures a Sankey generator.

        .nodePadding(10)
        .extent([[1, 5], [width - 1, height - 5]]);


    const linkscsv = csvdata;

    const nodescsv = Array.from(new Set(linkscsv.flatMap(l => [l.source, l.target])), name => ({name, category: name.replace(/ .*/, "")}));


    // const data = {nodes, links}

    // console.log(nodescsv)

    const linksWithPosVal = [];
   

    // linkscsv.forEach(function(link) {
    //     const colorCat = (link.value < 0) ? "green" : "orange";
        
    //     linksWithPosVal.push({
    //         source: link.source,
    //         target: link.target,
    //         value: Math.abs(link.value),
    //         color: colorCat,
    //     });
    // });

    
    linkscsv.forEach(function(link) {
        const colorCat = (link.value < 0) ? "green" : "orange";
        
        linksWithPosVal.push({
            source: link.source,
            target: link.target,
            value: Math.abs(link.value),
            color: colorCat,
        });
    });

    const {nodes, links} = sankey({
        nodes: nodescsv.map(d => Object.assign({}, d)),
        links: linksWithPosVal
        // links: linkscsv.map(d => {
        //     console.log(d)
        //     // d.value = +d.value;
        //     // if(d.value <= 0 ){ 
        //     //     d.value = -1;
        //         // d["flow"] = "negative" ;
        //     // } 
        //     // d.irene = "cool";
        //     return Object.assign({}, d => d)
        // })
            
    });

    // console.log(nodes)

    // console.log(links)

    // Defines a color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Creates the rects that represent the nodes.
    const rect = svg.append("g")
        .attr("stroke", "#000")
        .selectAll()
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => color(d.category));

    // Adds a title on the nodes.
    rect.append("title")
    //.text(d => `${d.name}\n${(d.value)} TWh`);
        .text(d => `${d.name}\n${format(d.value)} TWh`);

    // Creates the paths that represent the links.
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll()
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply");

    // Creates a gradient, if necessary, for the source-target color option.
    if (linkColor === "source-target") {
        const gradient = link.append("linearGradient")
            .attr("id", d => (d.uid = DOM.uid("link")).id)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("x2", d => d.target.x0);
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => color(d.source.category));
        //    .attr("stop-color", d => (d.color));
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d => color(d.target.category));
          // .attr("stop-color", d => (d.color));
    }

    // link.append("path")
    //     .attr("d", d3.sankeyLinkHorizontal())
    //     .attr("stroke", linkColor === "source-target" ? (d) => d.uid
    //         : linkColor === "source" ? (d) => color(d.source.category)
    //         : linkColor === "target" ? (d) => color(d.target.category) 
    //         : linkColor)
    //     .attr("stroke-width", d => Math.max(1, d.width));


    link.append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", linkColor === "source-target" ? (d) => d.uid
            : linkColor === "source" ? (d) => color(d.source.category)
            : linkColor === "target" ? (d) => color(d.target.category) 
            : linkColor === "chargeOrDischarge" ? d => d.color :
            linkColor)
        .attr("stroke-width", d => Math.max(1, d.width));


    link.append("title")
         .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)} TWh`);
       // .text(d => `${d.source.name} → ${d.target.name}\n${(d.value)} TWh`);
    // Adds labels on the nodes.
    svg.append("g")
        .selectAll()
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        // .text(d => d.name);
        .text(d => `${d.name}\n${format(d.value)} TWh`);

    //   return svg.node();
        





    });
});


