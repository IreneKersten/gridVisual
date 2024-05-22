// force directed diagram

document.addEventListener("DOMContentLoaded", function() {

    const container = d3.select("#svg-container");
    const divElement = container.node();
    
    // Verkrijg de breedte en hoogte van de div met behulp van clientWidth en clientHeight
     const width = divElement.clientWidth;
     const height = divElement.clientHeight;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("color", "pink")
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
    
    d3.csv("data5.csv").then(function(csvdata) {
    
 
        
        

        const linkscsv = csvdata;
    
        const nodeslist = Array.from(new Set(linkscsv.flatMap(l => [l.source, l.target])), name => ({name, category: name.replace(/ .*/, "")}));
        
        const nodeHash = {};

        nodeslist.forEach(node, index => {
            // const 
            const nodeName = node.name;
            const category = node.category;
            let value = 0;
        
            linkscsv.forEach(link => {
                if (link.target === nodeName) {
                    value += parseInt(link.value);
                } else if (link.source === nodeName) {
                    value -= parseInt(link.value);
                }
            });
        
            nodeHash[nodeName] = { category, value };
        });

        linkscsv.forEach(edge => {
            edge.weight = parseInt(edge.weight);
            edge.source = nodeHash[edge.source]
            edge.target = nodeHash[edge.target]
        })
        


        console.log("node hash: ")
         console.log(nodeHash);
    
        // const linksWithPosVal = [];
       

        // linkscsv.forEach(function(link) {
        //     const colorCat = (link.value < 0) ? "green" : "orange";
        //     const posOrNeg = (link.value < 0) ? "neg" : "pos";
            
        //     linksWithPosVal.push({
        //         source: link.source,
        //         target: link.target,
        //         realValue: (link.value),
        //         value: Math.abs(link.value),
        //         color: colorCat,
        //         extraCat: posOrNeg
               
                
        //     });
        // });

    const linkForce = d3.forceLink()

    let simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-40))
        .force("center", d3.forceCenter().x(300).y(300))
        .force("link", linkForce)
        // .nodes(nodesList)
        .on("tick",forceTick)

    simulation.force("link").links(linkscsv).id(d => d.name)

    d3.select("svg").selectAll("line.link")
    .data(linkscsv, d => `${d.source.id-d.target.id}`)
    .enter()
    .append("line")
    .attr("class","link")

console.log(nodeslist)
    let nodeEnter = d3.select("svg").selectAll("g.node")
    .data(nodeslist, d => d.name)
    .enter()
    .append("g")
    .attr("class", "node")
    nodeEnter.append("circle")
    .attr("r", 5)
    .style("text-anchor", "middle")
    .attr("y", 15)
    .text(d => d.name)

    function forceTick() {
        d3.selectAll("line.link")
        .attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y)
    // d3.selectAll("g.node")
    // .attr("transform", d => `translate(${d.x},${d.y})`)


    }

    

     
    

    
        });
    });
    
    
    
