// imdex 6 but updating according to new data TESTING!






document.addEventListener("DOMContentLoaded", function() {
    
    let csv = "";
    const container = d3.select("#svg-container");
    const divElement = container.node();

    const updateButton = d3.select(".update-button")
        .on("click", (event) => updateData());
    
    // Verkrijg de breedte en hoogte van de div met behulp van clientWidth en clientHeight
     const width = divElement.clientWidth;
     const height = divElement.clientHeight;


    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");


        // Bereken de hoek tussen de cirkel en de lijn
    // const angle = Math.atan2(y2 - y1, x2 - x1);

    // Bereken de coördinaten van de pijlpunt op de rand van de cirkel
  
    // const arrowY = (r) => {cy + r});

    const arrowPointHeight = 9;
    const arrowWidth = 12;
    const arrowCol = "rgb(167, 113, 175)";


    const arrowHead = d3.select("svg").append("defs")
        .append("marker")
        .attr("id", "triangle")
        .attr("refX", 3)
        .attr("refY", arrowWidth/2)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("markerWidth", 100)
        .attr("markerHeight", 35)
        .attr("orient", "auto")
        .append("path")
        .attr("d", 'M 0 0 12 6 0 12 3 6')
        .style("fill", arrowCol)
        // .style("opacity", 0.6)

    function updateData() {
        console.log("button clicked")
        if (!csv || csv == "data6.csv") {
            csv = "data5.csv";
        } else {
            csv = "data6.csv"
        }
        return redraw(csv)
    }

    function redraw(csvLink){
        console.log("redraw called with csv: "+ csvLink);
        d3.csv(csvLink).then(function(data) {
            const links = data.map(d => ({ source: d.source, target: d.target, value: +d.value }));

        
            const nodes = Array.from(new Set(data.flatMap(d => [d.source, d.target])))
            .map(id => {
                const incomingValues = data.filter(entry => entry.target === id).reduce((acc, curr) => acc + +curr.value, 0);
                const outgoingValues = data.filter(entry => entry.source === id).reduce((acc, curr) => acc + +curr.value, 0);

                let totalValue;
                //console.log(id + " " + !incomingValues)
                if (!incomingValues){
                    totalValue = -outgoingValues;
                } else {
                    totalValue = incomingValues ;
                }
                // const totalValue = incomingValues - outgoingValues;
                
        
                const catObject = data.find(entry => entry.source === id);
                const cat = catObject ? catObject.category : 99;
            
        
                return {
                    id,
                    category: cat,
                    value: totalValue
                };
            });
            ////console.log(nodes);
        



                
                // Map category values to colors
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(data.map(d => d.category));
            
            let allPosNodeValues = nodes.flatMap(n => Math.abs(n.value));
            let allNodeValues = nodes.flatMap(n =>n.value);
            let allLinkValues = links.flatMap(n => Math.abs(n.value));
            
            ////console.log(allPosNodeValues)
            
            const radiusScale = d3.scaleLinear()
                .domain(d3.extent(allPosNodeValues)).range([5, 20]);

            // const colorGradientScale =  d3.scaleLinear()
            //     .interpolate(d3.interpolateHsl)
            //     .domain(d3.extent(allNodeValues))
            //     .range(["yellow", "blue"]);
            const colorGradientScale =  d3.scaleQuantile()
                .domain(allNodeValues)
                .range(["orange", "blue"]);

            const opacityScale = d3.scaleLinear()
                .domain(d3.extent(allLinkValues)).range([0.5, 1]);


            function calculateArrowCoordinates(lineData) {
                ////console.log(lineData)
                const arrowPointDif = lineData.value ? arrowPointHeight : 0;
                const source = lineData.source;
                const target = lineData.target;
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
            
                
                
                
                // const sourceRadius = radiusScale(Math.abs(source.value));
                const targetRadius = radiusScale(Math.abs(target.value));

                // const sourceRadius = 0
                // const targetRadius = 0
            
                // Coördinaten van de pijlpunt op de rand van de broncirkel
                const arrowX1 = source.x + (dx / distance) ;
                const arrowY1 = source.y + (dy / distance);
            
                // Coördinaten van de pijlpunt op de rand van de doelcirkel
                const arrowX2 = target.x - (dx / distance) * (targetRadius + arrowPointDif);
                const arrowY2 = target.y - (dy / distance) * (targetRadius + arrowPointDif);
            
                return { x1: arrowX1, y1: arrowY1, x2: arrowX2, y2: arrowY2 };
            }
            
    
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links)
                        .id(d => d.id)
                        .distance(100))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));


            const linkgroups= svg.selectAll("g.link")
                .data(links)

            linkgroups
                .exit()
                .remove();

            const newLinkGroups = linkgroups
                .enter()
                .append("g")
                .attr("class", "link");
           

            newLinkGroups.append("line")
                .attr("stroke-width", d => radiusScale(d.value))
                .attr("marker-end", d => d.value ? "url(#triangle)" : "") // Don't draw arrow if empty value
                .style("stroke",d => d.value ? arrowCol : "grey" )
                .style("stroke-opacity",d => opacityScale(d.value));
                
            newLinkGroups.append("text");
             
            const mergedLinkGroups =  newLinkGroups.merge(linkgroups);





            //this is the working technique
            const nodeGroups = svg.selectAll("g.node")
                .data(nodes);
            
            nodeGroups
                .exit()
                .remove();
            const newNodeGroups = nodeGroups
                .enter()
                .append("g")
                .attr("class", "node")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
               
            newNodeGroups
                .append('circle')
                .attr("r", d => radiusScale(Math.abs(d.value)))
                // .attr("fill", node => colorScale(node.category)) // Color based on category
                .attr("fill", d => d.value ? colorGradientScale(d.value) : "grey")
                .call(drag(simulation))
                
            newNodeGroups
                .append("text") // Voeg tekst toe aan elke node
                .attr("class", "title")

            newNodeGroups
                .append("text") // Voeg tekst toe aan elke node
                .attr("class", "value centeredText")

            const mergedNodeGroups =  newNodeGroups.merge(nodeGroups);
    
           





        

            simulation.on("tick", () => {
                mergedLinkGroups.selectAll("line")
                    // .attr("x1", d => d.source.x )
                    // .attr("y1", d => d.source.y )
                    // .attr("x2", d => d.target.x )
                    // .attr("y2", d => d.target.y );
                    .attr("x1", d => calculateArrowCoordinates(d).x1)
                    .attr("y1", d => calculateArrowCoordinates(d).y1)
                    .attr("x2", d => calculateArrowCoordinates(d).x2)
                    .attr("y2", d => calculateArrowCoordinates(d).y2);

                mergedLinkGroups.selectAll("text")
                    .attr("x", d => d3.mean([d.source.x, d.target.x]))
                    .attr("y", d => d3.mean([d.source.y, d.target.y]))
                    .text(d => d.value);
                
                    //working:
                mergedNodeGroups.selectAll("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                mergedNodeGroups.selectAll("text.title")
                    .attr("x", d => d.x + 10)
                    .attr("y", d => d.y - 10)
                    .text(d => d.id);
                mergedNodeGroups.selectAll("text.value")
                    .attr("x", d => d.x )
                    .attr("y", d => d.y )
                    .text(d => d.value);
               
            });

            function drag(simulation) {
                function dragstarted(event, d) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                }

                function dragended(event, d) {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            }

            function handleMouseOver(event, d) {
                // Show additional information on hover
                // svg.append("text")
                //     .attr("id", "tooltip")
                //     .attr("x", d.x + 10)
                //     .attr("y", d.y - 10)
                //     .text(d.id);
                console.log(this)

                d3.select(this)
                .selectAll("text.value")
                .style("stroke", "white");


                // svg.append("text")
                //     .attr("id", "tooltip")
                //     .attr("class", "centeredText")
                //     .attr("x", d.x )
                //     .attr("y", d.y )
                //     .text(d.value)
                //     .style("stroke", "white");
            }

            function handleMouseOut(event, d) {
                // Remove the tooltip when mouse leaves the circle
                // svg.select("#tooltip").remove();
                d3.select(this)
                .selectAll("text.value")
                .style("stroke", "black");
            }

        })
    }
});
    

    
    