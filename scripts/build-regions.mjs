import fs from 'fs';
import {topology} from 'topojson-server';
import {merge, mesh} from 'topojson-client';
import {geoPath, geoTransform} from 'd3-geo';
const j=JSON.parse(fs.readFileSync('kr.json'));
const PROV={'11':'서울특별시','21':'부산광역시','22':'대구광역시','23':'인천광역시','24':'광주광역시','25':'대전광역시','26':'울산광역시','29':'세종특별자치시','31':'경기도','32':'강원특별자치도','33':'충청북도','34':'충청남도','35':'전북특별자치도','36':'전라남도','37':'경상북도','38':'경상남도','39':'제주특별자치도'};
const METRO={'11':'서울','21':'부산','22':'대구','23':'인천','24':'광주','25':'대전','26':'울산','29':'세종'};
const EN={};
for(const f of j.features){const {code,name,name_eng}=f.properties;const pc=code.slice(0,2);let key,prov=PROV[pc];
 if(METRO[pc]&&!name.endsWith('군')){key=METRO[pc];}
 else if(name==='청원군'){key='청주시';}
 else {const m=name.match(/^(.+시).+구$/);key=m?m[1]:name;}
 if(name==='군위군')prov='대구광역시';
 f.properties.k=pc+'|'+key;f.properties.prov=prov;f.properties.label=key;}
const topo=topology({r:j},1e5);
const geoms=topo.objects.r.geometries;
// carry properties
geoms.forEach((g,i)=>g.properties=j.features[i].properties);
const groups={};for(const g of geoms){(groups[g.properties.k]??=[]).push(g);}
const lon0=124.5,lat1=38.7,kx=Math.cos(36.3*Math.PI/180),S=170;
let maxx=0,maxy=0;
const proj=geoTransform({point(x,y){const X=(x-lon0)*kx*S,Y=(lat1-y)*S;maxx=Math.max(maxx,X);maxy=Math.max(maxy,Y);this.stream.point(X,Y)}});
const p=geoPath(proj).digits(1);
const regions=[];
for(const [k,gs] of Object.entries(groups)){const m=merge(topo,gs);const d=p(m);const b=p.bounds(m);
 let big=null,ba=-1;const polys=m.type==='MultiPolygon'?m.coordinates:[m.coordinates];
 for(const c of polys){const f={type:'Polygon',coordinates:c};const a=p.area(f);if(a>ba){ba=a;big=f;}}
 const c=p.centroid(big).map(v=>Math.round(v*10)/10);
 const pr=gs[0].properties.prov;let label=gs[0].properties.label;
 regions.push({n:label,p:pr,d,c,s:label.length>2&&/[시군]$/.test(label)?label.slice(0,-1):label.replace(/[시군]$/,'')||label,b:b.flat().map(v=>Math.round(v*10)/10)});}
const prov=p(mesh(topo,topo.objects.r,(a,b)=>a!==b&&a.properties.prov!==b.properties.prov));
const out={w:Math.ceil(maxx)+10,h:Math.ceil(maxy)+10,regions,prov};
fs.writeFileSync('regions.json',JSON.stringify(out));
console.log(out.w,out.h,regions.length,JSON.stringify(out).length);
console.log(regions.map(r=>r.n).join(' '));
