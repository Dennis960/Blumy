(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ee=window,Ae=ee.ShadowRoot&&(ee.ShadyCSS===void 0||ee.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ce=Symbol(),Ne=new WeakMap;class Ke{constructor(e,t,s){if(this._$cssResult$=!0,s!==Ce)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Ae&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=Ne.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Ne.set(t,e))}return e}toString(){return this.cssText}}const pt=n=>new Ke(typeof n=="string"?n:n+"",void 0,Ce),$=(n,...e)=>{const t=n.length===1?n[0]:e.reduce((s,r,i)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+n[i+1],n[0]);return new Ke(t,n,Ce)},ht=(n,e)=>{Ae?n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{const s=document.createElement("style"),r=ee.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,n.appendChild(s)})},je=Ae?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return pt(t)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var de;const te=window,Ue=te.trustedTypes,ut=Ue?Ue.emptyScript:"",Re=te.reactiveElementPolyfillSupport,_e={toAttribute(n,e){switch(e){case Boolean:n=n?ut:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},Ze=(n,e)=>e!==n&&(e==e||n==n),me={attribute:!0,type:String,converter:_e,reflect:!1,hasChanged:Ze},be="finalized";class D extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,s)=>{const r=this._$Ep(s,t);r!==void 0&&(this._$Ev.set(r,s),e.push(r))}),e}static createProperty(e,t=me){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const s=typeof e=="symbol"?Symbol():"__"+e,r=this.getPropertyDescriptor(e,s,t);r!==void 0&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){return{get(){return this[t]},set(r){const i=this[e];this[t]=r,this.requestUpdate(e,i,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||me}static finalize(){if(this.hasOwnProperty(be))return!1;this[be]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,s=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const r of s)this.createProperty(r,t[r])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(je(r))}else e!==void 0&&t.push(je(e));return t}static _$Ep(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,s;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((s=e.hostConnected)===null||s===void 0||s.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return ht(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var s;return(s=t.hostConnected)===null||s===void 0?void 0:s.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var s;return(s=t.hostDisconnected)===null||s===void 0?void 0:s.call(t)})}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$EO(e,t,s=me){var r;const i=this.constructor._$Ep(e,s);if(i!==void 0&&s.reflect===!0){const o=(((r=s.converter)===null||r===void 0?void 0:r.toAttribute)!==void 0?s.converter:_e).toAttribute(t,s.type);this._$El=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$El=null}}_$AK(e,t){var s;const r=this.constructor,i=r._$Ev.get(e);if(i!==void 0&&this._$El!==i){const o=r.getPropertyOptions(i),u=typeof o.converter=="function"?{fromAttribute:o.converter}:((s=o.converter)===null||s===void 0?void 0:s.fromAttribute)!==void 0?o.converter:_e;this._$El=i,this[i]=u.fromAttribute(t,o.type),this._$El=null}}requestUpdate(e,t,s){let r=!0;e!==void 0&&(((s=s||this.constructor.getPropertyOptions(e)).hasChanged||Ze)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),s.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,s))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((r,i)=>this[i]=r),this._$Ei=void 0);let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),(e=this._$ES)===null||e===void 0||e.forEach(r=>{var i;return(i=r.hostUpdate)===null||i===void 0?void 0:i.call(r)}),this.update(s)):this._$Ek()}catch(r){throw t=!1,this._$Ek(),r}t&&this._$AE(s)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(s=>{var r;return(r=s.hostUpdated)===null||r===void 0?void 0:r.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,s)=>this._$EO(s,this[s],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}D[be]=!0,D.elementProperties=new Map,D.elementStyles=[],D.shadowRootOptions={mode:"open"},Re==null||Re({ReactiveElement:D}),((de=te.reactiveElementVersions)!==null&&de!==void 0?de:te.reactiveElementVersions=[]).push("1.6.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ve;const re=window,N=re.trustedTypes,Le=N?N.createPolicy("lit-html",{createHTML:n=>n}):void 0,we="$lit$",b=`lit$${(Math.random()+"").slice(9)}$`,Ge="?"+b,dt=`<${Ge}>`,O=document,B=()=>O.createComment(""),I=n=>n===null||typeof n!="object"&&typeof n!="function",Je=Array.isArray,mt=n=>Je(n)||typeof(n==null?void 0:n[Symbol.iterator])=="function",fe=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ke=/-->/g,Me=/>/g,A=RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),He=/'/g,Be=/"/g,Ye=/^(?:script|style|textarea|title)$/i,vt=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),p=vt(1),E=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),Ie=new WeakMap,C=O.createTreeWalker(O,129,null,!1),ft=(n,e)=>{const t=n.length-1,s=[];let r,i=e===2?"<svg>":"",o=H;for(let l=0;l<t;l++){const a=n[l];let _,c,d=-1,y=0;for(;y<a.length&&(o.lastIndex=y,c=o.exec(a),c!==null);)y=o.lastIndex,o===H?c[1]==="!--"?o=ke:c[1]!==void 0?o=Me:c[2]!==void 0?(Ye.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=A):c[3]!==void 0&&(o=A):o===A?c[0]===">"?(o=r!=null?r:H,d=-1):c[1]===void 0?d=-2:(d=o.lastIndex-c[2].length,_=c[1],o=c[3]===void 0?A:c[3]==='"'?Be:He):o===Be||o===He?o=A:o===ke||o===Me?o=H:(o=A,r=void 0);const Q=o===A&&n[l+1].startsWith("/>")?" ":"";i+=o===H?a+dt:d>=0?(s.push(_),a.slice(0,d)+we+a.slice(d)+b+Q):a+b+(d===-2?(s.push(void 0),l):Q)}const u=i+(n[t]||"<?>")+(e===2?"</svg>":"");if(!Array.isArray(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return[Le!==void 0?Le.createHTML(u):u,s]};class z{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let i=0,o=0;const u=e.length-1,l=this.parts,[a,_]=ft(e,t);if(this.el=z.createElement(a,s),C.currentNode=this.el.content,t===2){const c=this.el.content,d=c.firstChild;d.remove(),c.append(...d.childNodes)}for(;(r=C.nextNode())!==null&&l.length<u;){if(r.nodeType===1){if(r.hasAttributes()){const c=[];for(const d of r.getAttributeNames())if(d.endsWith(we)||d.startsWith(b)){const y=_[o++];if(c.push(d),y!==void 0){const Q=r.getAttribute(y.toLowerCase()+we).split(b),X=/([.?@])?(.*)/.exec(y);l.push({type:1,index:i,name:X[2],strings:Q,ctor:X[1]==="."?gt:X[1]==="?"?_t:X[1]==="@"?bt:ce})}else l.push({type:6,index:i})}for(const d of c)r.removeAttribute(d)}if(Ye.test(r.tagName)){const c=r.textContent.split(b),d=c.length-1;if(d>0){r.textContent=N?N.emptyScript:"";for(let y=0;y<d;y++)r.append(c[y],B()),C.nextNode(),l.push({type:2,index:++i});r.append(c[d],B())}}}else if(r.nodeType===8)if(r.data===Ge)l.push({type:2,index:i});else{let c=-1;for(;(c=r.data.indexOf(b,c+1))!==-1;)l.push({type:7,index:i}),c+=b.length-1}i++}}static createElement(e,t){const s=O.createElement("template");return s.innerHTML=e,s}}function j(n,e,t=n,s){var r,i,o,u;if(e===E)return e;let l=s!==void 0?(r=t._$Co)===null||r===void 0?void 0:r[s]:t._$Cl;const a=I(e)?void 0:e._$litDirective$;return(l==null?void 0:l.constructor)!==a&&((i=l==null?void 0:l._$AO)===null||i===void 0||i.call(l,!1),a===void 0?l=void 0:(l=new a(n),l._$AT(n,t,s)),s!==void 0?((o=(u=t)._$Co)!==null&&o!==void 0?o:u._$Co=[])[s]=l:t._$Cl=l),l!==void 0&&(e=j(n,l._$AS(n,e.values),l,s)),e}class $t{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:s},parts:r}=this._$AD,i=((t=e==null?void 0:e.creationScope)!==null&&t!==void 0?t:O).importNode(s,!0);C.currentNode=i;let o=C.nextNode(),u=0,l=0,a=r[0];for(;a!==void 0;){if(u===a.index){let _;a.type===2?_=new J(o,o.nextSibling,this,e):a.type===1?_=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(_=new wt(o,this,e)),this._$AV.push(_),a=r[++l]}u!==(a==null?void 0:a.index)&&(o=C.nextNode(),u++)}return C.currentNode=O,i}v(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class J{constructor(e,t,s,r){var i;this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cp=(i=r==null?void 0:r.isConnected)===null||i===void 0||i}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=j(this,e,t),I(e)?e===f||e==null||e===""?(this._$AH!==f&&this._$AR(),this._$AH=f):e!==this._$AH&&e!==E&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):mt(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==f&&I(this._$AH)?this._$AA.nextSibling.data=e:this.$(O.createTextNode(e)),this._$AH=e}g(e){var t;const{values:s,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=z.createElement(r.h,this.options)),r);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===i)this._$AH.v(s);else{const o=new $t(i,this),u=o.u(this.options);o.v(s),this.$(u),this._$AH=o}}_$AC(e){let t=Ie.get(e.strings);return t===void 0&&Ie.set(e.strings,t=new z(e)),t}T(e){Je(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const i of e)r===t.length?t.push(s=new J(this.k(B()),this.k(B()),this,this.options)):s=t[r],s._$AI(i),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,t);e&&e!==this._$AB;){const r=e.nextSibling;e.remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}}class ce{constructor(e,t,s,r,i){this.type=1,this._$AH=f,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=f}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,s,r){const i=this.strings;let o=!1;if(i===void 0)e=j(this,e,t,0),o=!I(e)||e!==this._$AH&&e!==E,o&&(this._$AH=e);else{const u=e;let l,a;for(e=i[0],l=0;l<i.length-1;l++)a=j(this,u[s+l],t,l),a===E&&(a=this._$AH[l]),o||(o=!I(a)||a!==this._$AH[l]),a===f?e=f:e!==f&&(e+=(a!=null?a:"")+i[l+1]),this._$AH[l]=a}o&&!r&&this.j(e)}j(e){e===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e!=null?e:"")}}class gt extends ce{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===f?void 0:e}}const yt=N?N.emptyScript:"";class _t extends ce{constructor(){super(...arguments),this.type=4}j(e){e&&e!==f?this.element.setAttribute(this.name,yt):this.element.removeAttribute(this.name)}}class bt extends ce{constructor(e,t,s,r,i){super(e,t,s,r,i),this.type=5}_$AI(e,t=this){var s;if((e=(s=j(this,e,t,0))!==null&&s!==void 0?s:f)===E)return;const r=this._$AH,i=e===f&&r!==f||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==f&&(r===f||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,s;typeof this._$AH=="function"?this._$AH.call((s=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&s!==void 0?s:this.element,e):this._$AH.handleEvent(e)}}class wt{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){j(this,e)}}const ze=re.litHtmlPolyfillSupport;ze==null||ze(z,J),((ve=re.litHtmlVersions)!==null&&ve!==void 0?ve:re.litHtmlVersions=[]).push("2.7.4");const Et=(n,e,t)=>{var s,r;const i=(s=t==null?void 0:t.renderBefore)!==null&&s!==void 0?s:e;let o=i._$litPart$;if(o===void 0){const u=(r=t==null?void 0:t.renderBefore)!==null&&r!==void 0?r:null;i._$litPart$=o=new J(e.insertBefore(B(),u),u,void 0,t!=null?t:{})}return o._$AI(n),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var $e,ge;class v extends D{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const s=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=s.firstChild),s}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Et(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return E}}v.finalized=!0,v._$litElement$=!0,($e=globalThis.litElementHydrateSupport)===null||$e===void 0||$e.call(globalThis,{LitElement:v});const Fe=globalThis.litElementPolyfillSupport;Fe==null||Fe({LitElement:v});((ge=globalThis.litElementVersions)!==null&&ge!==void 0?ge:globalThis.litElementVersions=[]).push("3.3.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xt=({finisher:n,descriptor:e})=>(t,s)=>{var r;if(s===void 0){const i=(r=t.originalKey)!==null&&r!==void 0?r:t.key,o=e!=null?{kind:"method",placement:"prototype",key:i,descriptor:e(t.key)}:{...t,key:i};return n!=null&&(o.finisher=function(u){n(u,i)}),o}{const i=t.constructor;e!==void 0&&Object.defineProperty(t,s,e(s)),n==null||n(i,s)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const m=n=>e=>typeof e=="function"?((t,s)=>(customElements.define(t,s),s))(n,e):((t,s)=>{const{kind:r,elements:i}=s;return{kind:r,elements:i,finisher(o){customElements.define(t,o)}}})(n,e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Pt=(n,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(t){t.createProperty(e.key,n)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,n)}},At=(n,e,t)=>{e.constructor.createProperty(t,n)};function h(n){return(e,t)=>t!==void 0?At(n,e,t):Pt(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function g(n){return h({...n,state:!0})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Y(n,e){return xt({descriptor:t=>{const s={get(){var r,i;return(i=(r=this.renderRoot)===null||r===void 0?void 0:r.querySelector(n))!==null&&i!==void 0?i:null},enumerable:!0,configurable:!0};if(e){const r=typeof t=="symbol"?Symbol():"__"+t;s.get=function(){var i,o;return this[r]===void 0&&(this[r]=(o=(i=this.renderRoot)===null||i===void 0?void 0:i.querySelector(n))!==null&&o!==void 0?o:null),this[r]}}return s}})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ye;((ye=window.HTMLSlotElement)===null||ye===void 0?void 0:ye.prototype.assignedElements)!=null;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Qe={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Xe=n=>(...e)=>({_$litDirective$:n,values:e});class et{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const w=Xe(class extends et{constructor(n){var e;if(super(n),n.type!==Qe.ATTRIBUTE||n.name!=="class"||((e=n.strings)===null||e===void 0?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(e=>n[e]).join(" ")+" "}update(n,[e]){var t,s;if(this.it===void 0){this.it=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(i=>i!=="")));for(const i in e)e[i]&&!(!((t=this.nt)===null||t===void 0)&&t.has(i))&&this.it.add(i);return this.render(e)}const r=n.element.classList;this.it.forEach(i=>{i in e||(r.remove(i),this.it.delete(i))});for(const i in e){const o=!!e[i];o===this.it.has(i)||((s=this.nt)===null||s===void 0?void 0:s.has(i))||(o?(r.add(i),this.it.add(i)):(r.remove(i),this.it.delete(i)))}return E}});var Ct=Object.defineProperty,Ot=Object.getOwnPropertyDescriptor,R=(n,e,t,s)=>{for(var r=s>1?void 0:s?Ot(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Ct(e,t,r),r};let F=class extends v{click(){this.dispatchEvent(new CustomEvent("dotClicked"))}render(){const n={active:this.active,done:this.done};return p`<li class="dot">
            <button class=${w(n)} @click="${this.click}"></button>
        </li>`}};F.styles=$`
        button {
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
            background-color: var(--grey);
            border: none;
            cursor: pointer;
        }
        button.active {
            background-color: var(--primary-base);
            cursor: default;
        }
        button.done {
            background-color: var(--primary-light);
        }
    `;R([h({type:Boolean})],F.prototype,"active",2);R([h({type:Boolean})],F.prototype,"done",2);F=R([m("dot-element")],F);let V=class extends v{render(){return p`
            <ol>
                ${Array.from({length:this.numberOfDots},(n,e)=>p`<dot-element
                        ?active=${e===this.currentDot}
                        ?done=${e<this.currentDot}
                        @dotClicked="${()=>{this.dispatchEvent(new CustomEvent("dotClicked",{detail:e}))}}"
                    ></dot-element>`)}
            </ol>
        `}};V.styles=$`
        :host {
            margin: 1.5rem;
        }
        span {
            text-shadow: 0 0 1px black;
        }
        ol {
            display: flex;
            flex-direction: row;
            column-gap: 0.25rem;
            align-items: center;
            justify-content: center;
            list-style: none;
            padding: 0;
            margin: 0;
        }
    `;R([h({type:Number})],V.prototype,"numberOfDots",2);R([h({type:Number})],V.prototype,"currentDot",2);V=R([m("dots-stepper-element")],V);var St=Object.defineProperty,Tt=Object.getOwnPropertyDescriptor,Oe=(n,e,t,s)=>{for(var r=s>1?void 0:s?Tt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&St(e,t,r),r};let q=class extends v{render(){return p`
            <span>${this.icon}</span>
            <div class="title">${this.title}</div>
        `}};q.styles=$`
        :host {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 1.5rem;
            padding: 1.5rem 2rem;
            box-sizing: border-box;
            column-gap: 0.75rem;
            background-color: var(--primary-base);
            color: var(--text-light);
        }
        span {
            text-shadow: 0 0 1px black;
        }
        .title {
            font-weight: 600;
        }
    `;Oe([h()],q.prototype,"title",2);Oe([h()],q.prototype,"icon",2);q=Oe([m("header-element")],q);var Dt=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,Se=(n,e,t,s)=>{for(var r=s>1?void 0:s?Nt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Dt(e,t,r),r};let W=class extends v{render(){const n={secondary:this.secondary};return p`
            <button class=${w(n)}>
                <slot></slot>${this.name}
            </button>
        `}};W.styles=[$`
            button {
                width: 100%;
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem 0.75rem;
                margin: 0.5rem 0;
                cursor: pointer;
                font-size: 100%;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            button.secondary {
                background-color: var(--secondary-base);
                color: var(--text-light);
            }
        `];Se([h({type:Boolean})],W.prototype,"secondary",2);Se([h({type:String})],W.prototype,"name",2);W=Se([m("button-element")],W);var jt=Object.defineProperty,Ut=Object.getOwnPropertyDescriptor,Rt=(n,e,t,s)=>{for(var r=s>1?void 0:s?Ut(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&jt(e,t,r),r};let Ee=class extends v{render(){return p`
            <div class="button-nav">
                <slot></slot>
            </div>
        `}};Ee.styles=[$`
            .button-nav {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                row-gap: 1rem;
            }
        `];Ee=Rt([m("button-nav-element")],Ee);var Lt=Object.defineProperty,kt=Object.getOwnPropertyDescriptor,tt=(n,e,t,s)=>{for(var r=s>1?void 0:s?kt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Lt(e,t,r),r};let se=class extends v{render(){return p`<div class="description">${this.description}</div>`}};se.styles=[$`
            .description {
                margin-bottom: 0.75rem;
            }
        `];tt([h({type:String})],se.prototype,"description",2);se=tt([m("description-element")],se);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const rt="important",Mt=" !"+rt,xe=Xe(class extends et{constructor(n){var e;if(super(n),n.type!==Qe.ATTRIBUTE||n.name!=="style"||((e=n.strings)===null||e===void 0?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(n){return Object.keys(n).reduce((e,t)=>{const s=n[t];return s==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(n,[e]){const{style:t}=n.element;if(this.ut===void 0){this.ut=new Set;for(const s in e)this.ut.add(s);return this.render(e)}this.ut.forEach(s=>{e[s]==null&&(this.ut.delete(s),s.includes("-")?t.removeProperty(s):t[s]="")});for(const s in e){const r=e[s];if(r!=null){this.ut.add(s);const i=typeof r=="string"&&r.endsWith(Mt);s.includes("-")||i?t.setProperty(s,i?r.slice(0,-11):r,i?rt:""):t[s]=r}}return E}});var Ht=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,st=(n,e,t,s)=>{for(var r=s>1?void 0:s?Bt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Ht(e,t,r),r};let ne=class extends v{render(){return p`
            <div
                class="error-text"
                style="${xe({display:this.text?"":"none"})}"
            >
                ${this.text}
            </div>
        `}};ne.styles=[$`
            .error-text {
                color: var(--error);
                margin-bottom: 0.75rem;
            }
        `];st([h({type:String})],ne.prototype,"text",2);ne=st([m("error-text-element")],ne);var It=Object.defineProperty,zt=Object.getOwnPropertyDescriptor,pe=(n,e,t,s)=>{for(var r=s>1?void 0:s?zt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&It(e,t,r),r};let U=class extends v{constructor(){super(...arguments),this.type="text",this.onChange=n=>{const e=n.target;this.value=e.value,this.dispatchEvent(new CustomEvent("change",{detail:this.value}))}}render(){return p`
            <label for="input">${this.label}</label>
            <input id="input" type="${this.type}" placeholder="${this.label}" value="${this.value}" @change="${this.onChange}" />
        `}};U.styles=[$`
            :host {
                display: flex;
                flex-direction: row;
                align-items: center;
                column-gap: 1rem;
                width: 100%;
                margin-bottom: 0.75rem;
            }
            input {
                flex-grow: 1;
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem;
                line-height: 1.15;
                font-size: 100%;
            }
        `];pe([h({type:String})],U.prototype,"label",2);pe([h({type:String})],U.prototype,"type",2);pe([h()],U.prototype,"value",2);U=pe([m("input-element")],U);var Ft=Object.defineProperty,Vt=Object.getOwnPropertyDescriptor,nt=(n,e,t,s)=>{for(var r=s>1?void 0:s?Vt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Ft(e,t,r),r};let ie=class extends v{constructor(){super(...arguments),this.progress=0}render(){return p`
            <div class="progress-bar" style=${xe({display:`${this.progress==0?"none":""}`})}>
                <div
                    class="progress-bar-fill"
                    style=${xe({width:`${this.progress}%`})}
                ></div>
            </div>
        `}};ie.styles=[$`
            .progress-bar {
                grid-column: 1 / -1;
                margin-bottom: 1rem;
            }
            .progress-bar-fill {
                height: 0.25rem;
                background-color: var(--primary-base);
            }
        `];nt([h({type:Number})],ie.prototype,"progress",2);ie=nt([m("progress-bar-element")],ie);var qt=Object.defineProperty,Wt=Object.getOwnPropertyDescriptor,it=(n,e,t,s)=>{for(var r=s>1?void 0:s?Wt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&qt(e,t,r),r};let oe=class extends v{render(){return p`<div class="title">${this.title}</div>`}};oe.styles=[$`
            .title {
                font-size: 1.25rem;
                margin-bottom: 0.75rem;
            }
        `];it([h({type:String})],oe.prototype,"title",2);oe=it([m("title-element")],oe);var Kt=Object.defineProperty,Zt=Object.getOwnPropertyDescriptor,ot=(n,e,t,s)=>{for(var r=s>1?void 0:s?Zt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Kt(e,t,r),r};let le=class extends v{constructor(){super(...arguments),this.wifis=[]}onClick(n){this.dispatchEvent(new CustomEvent("networkClick",{detail:n}))}render(){return p`
            <ul>
                ${this.wifis.sort((n,e)=>e.rssi-n.rssi).map(n=>p`
                        <li>
                            <button-element
                                @click="${()=>this.onClick(n)}"
                            >
                                <wifi-logo-element rssi="${n.rssi}" ?isSecure="${n.secure!=7}"></wifi-logo-element>
                                <span>${n.ssid}</span>
                            </button-element>
                        </li>
                    `)}
            </ul>
        `}};le.styles=[$`
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                margin-bottom: 0.75rem;
            }
            button-element {
                width: 100%;
            }
        `];ot([h({type:Array})],le.prototype,"wifis",2);le=ot([m("wifi-list-element")],le);var Gt=Object.defineProperty,Jt=Object.getOwnPropertyDescriptor,Te=(n,e,t,s)=>{for(var r=s>1?void 0:s?Jt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Gt(e,t,r),r};let K=class extends v{get strength(){const e=(Math.max(-100,Math.min(this.rssi,-30))+100)/70;return Math.floor(e*4)}render(){return p`
            <div class="${w({active:this.strength>=3})}">
                <div class="${w({active:this.strength>=2})}">
                    <div class="${w({active:this.strength>=1})}">
                        <div
                            class="${w({active:this.strength>=0})}"
                        ></div>
                    </div>
                </div>
            </div>
            <span class="${w({hidden:!this.isSecure,lock:!0})}"> 🔒 </span>
        `}};K.styles=[$`
            :host {
                position: relative;
                transform: translateY(25%)
            }
            div {
                border: 2px solid transparent;
                border-top-color: var(--grey);
                border-radius: 50%;
                margin: 1px;
            }
            div.active {
                border-top-color: var(--text);
            }
            .lock {
                position: absolute;
                right: 0;
                bottom: 0.5rem;
                font-size: 0.5rem;
            }
            .hidden {
                display: none;
            }
        `];Te([h({type:Number})],K.prototype,"rssi",2);Te([h({type:Boolean})],K.prototype,"isSecure",2);K=Te([m("wifi-logo-element")],K);class L extends v{back(){this.dispatchEvent(new CustomEvent("back"))}next(e){this.dispatchEvent(new CustomEvent("next",{detail:e}))}}var Yt=Object.defineProperty,Qt=Object.getOwnPropertyDescriptor,Xt=(n,e,t,s)=>{for(var r=s>1?void 0:s?Qt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Yt(e,t,r),r};let Ve=class extends L{render(){return p`
            <title-element title="MQTT Configuration (optional)"></title-element>
            <input-element type="text" label="Server"></input-element>
            <input-element type="number" label="Port"></input-element>
            <input-element type="text" label="User"></input-element>
            <input-element type="password" label="Password"></input-element>
            <input-element type="text" label="Topic"></input-element>
            <input-element type="text" label="Client-ID"></input-element>
            <error-text-element text=""></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${!1}"
                ></button-element>
                <button-element
                    name="Connect"
                    @click="${this.next}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};Ve=Xt([m("mqtt-page")],Ve);var Pe=(n=>(n[n.IDLE=0]="IDLE",n[n.NO_SSID_AVAIL=1]="NO_SSID_AVAIL",n[n.CONNECTED=3]="CONNECTED",n[n.CONNECT_FAILED=4]="CONNECT_FAILED",n[n.CONNECT_WRONG_PASSWORD=6]="CONNECT_WRONG_PASSWORD",n[n.DISCONNECTED=7]="DISCONNECTED",n[n.ERROR=8]="ERROR",n))(Pe||{});async function lt(n,e){return await fetch(n,{method:"POST",body:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})}async function De(n){return await fetch(n).then(e=>e.json()).catch(e=>(console.error(e),null))}async function er(n){const e=new URLSearchParams;return e.append("name",n),await lt("/plantName",e)}async function tr(){return await De("/networks")}async function rr(n,e){const t=new URLSearchParams;return t.append("ssid",n),t.append("password",e),await lt("/connect",t)}async function sr(){const n=await De("/isConnected");return n==null?8:Number(n)}async function qe(){return Number(await De("/update/percentage"))}async function at(n,e){const t=new FormData;return t.append("upload",n),await fetch(e,{method:"POST",body:t})}async function nr(n){return await at(n,"/update/littlefs")}async function ir(n){return await at(n,"/update/firmware")}var or=Object.defineProperty,lr=Object.getOwnPropertyDescriptor,he=(n,e,t,s)=>{for(var r=s>1?void 0:s?lr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&or(e,t,r),r};let Z=class extends L{constructor(){super(...arguments),this.errorText=""}async submit(){var t;const n=(t=this.nameElement.value)!=null?t:"";if(n.length<1||n.length>32){this.errorText="Name must be between 1 and 32 characters";return}else this.errorText="";if(!(await er(n)).ok){this.errorText="Error, device not responding";return}}render(){return p`
            <title-element title="Choose a name for your plant"></title-element>
            <input-element id="name" label="Plant Name"></input-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${!1}"
                ></button-element>
                <button-element
                    name="Skip"
                    @click="${this.next}"
                    ?secondary="${!0}"
                ></button-element>
                <button-element
                    name="Submit"
                    @click="${this.submit}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};he([h({type:String})],Z.prototype,"onlineStatus",2);he([Y("#name")],Z.prototype,"nameElement",2);he([g()],Z.prototype,"errorText",2);Z=he([m("name-page")],Z);var ar=Object.defineProperty,cr=Object.getOwnPropertyDescriptor,T=(n,e,t,s)=>{for(var r=s>1?void 0:s?cr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&ar(e,t,r),r};let x=class extends L{constructor(){super(...arguments),this.errorText="",this.littlefsProgress=0,this.firmwareProgress=0}async upload(){if(!this.littlefsElement.value&&!this.firmwareElement.value){this.errorText="Please select a file to upload";return}console.log(this.littlefsElement.value),this.littlefsElement.value&&((async()=>{for(;!this.errorText&&this.littlefsProgress<100;)await qe().then(e=>{this.littlefsProgress=e}),await new Promise(e=>setTimeout(e,300))})(),(await nr(this.littlefsElement.value)).ok||(this.errorText="Error, device not responding"),this.errorText||(this.littlefsProgress=100)),this.firmwareElement.value&&((async()=>{for(;!this.errorText&&this.firmwareProgress<100;)await qe().then(e=>{this.firmwareProgress=e}),await new Promise(e=>setTimeout(e,300))})(),(await ir(this.firmwareElement.value)).ok||(this.errorText="Error, device not responding"),this.errorText||(this.firmwareProgress=100))}render(){return p`
            <title-element title="Update Firmware"></title-element>
            <input-element
                id="littlefs"
                label="littlefs.bin"
                type="file"
            ></input-element>
            <progress-bar-element
                progress="${this.littlefsProgress}"
            ></progress-bar-element>
            <input-element
                id="firmware"
                label="firmware.bin"
                type="file"
            ></input-element>
            <progress-bar-element
                progress="${this.firmwareProgress}"
            ></progress-bar-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${!1}"
                ></button-element>
                <button-element
                name="Skip"
                @click="${this.next}"
                ?secondary="${!0}"
                ></button-element>
                <button-element
                    name="Upload"
                    @click="${this.upload}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};T([h({type:String})],x.prototype,"onlineStatus",2);T([g()],x.prototype,"errorText",2);T([Y("#littlefs")],x.prototype,"littlefsElement",2);T([Y("#firmware")],x.prototype,"firmwareElement",2);T([g()],x.prototype,"littlefsProgress",2);T([g()],x.prototype,"firmwareProgress",2);x=T([m("update-page")],x);var pr=Object.defineProperty,hr=Object.getOwnPropertyDescriptor,ur=(n,e,t,s)=>{for(var r=s>1?void 0:s?hr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&pr(e,t,r),r};let We=class extends L{render(){return p`
            <title-element title="Welcome"></title-element>
            <description-element
                description="${`PlantFi is currently offline. Start the setup
                    to connect it to a WiFi network`}"
            ></description-element>
            <button-nav-element>
                <button-element
                    name="Start Setup"
                    @click="${this.next}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};We=ur([m("welcome-page")],We);var dr=Object.defineProperty,mr=Object.getOwnPropertyDescriptor,ue=(n,e,t,s)=>{for(var r=s>1?void 0:s?mr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&dr(e,t,r),r};let G=class extends L{constructor(){super(),this.errorText="",this.networks=[],this.interval=setInterval(()=>{this.updateNetworks()},5e3),this.updateNetworks(),this.addEventListener("page-destroy",()=>{})}async updateNetworks(){const n=await tr();if(n==null){this.errorText="Error getting networks";return}this.networks=n}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.interval)}onNetworkClick(n){const e=n.detail;this.next({network:e})}render(){return p`
            <title-element title="Select WiFi Network"></title-element>
            <description-element
                description="Available WiFi Networks:"
            ></description-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <wifi-list-element
                .wifis="${this.networks}"
                @networkClick="${this.onNetworkClick}"
            ></wifi-list-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${!1}"
                ></button-element>
                <button-element
                    name="Enter Manually"
                    @click="${this.next}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};ue([h({type:String})],G.prototype,"onlineStatus",2);ue([g()],G.prototype,"errorText",2);ue([g()],G.prototype,"networks",2);G=ue([m("wifi-scanner-page")],G);var vr=Object.defineProperty,fr=Object.getOwnPropertyDescriptor,k=(n,e,t,s)=>{for(var r=s>1?void 0:s?fr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&vr(e,t,r),r};let S=class extends L{constructor(){super(),this.errorText="",this.autoConnect&&this.connect()}async connect(){if(this.errorText="",!(await rr(this.ssidElement.value,this.passwordElement.value)).ok){this.errorText="Error, device not responding";return}for(let e=0;e<10;e++){const t=await sr();if(t==Pe.ERROR){this.errorText="Error, device not responding";return}if(t==Pe.CONNECTED){this.next();return}await new Promise(s=>setTimeout(s,1e3))}this.errorText="Could not connect to WiFi"}render(){return p`
            <title-element title="Enter WiFi Credentials"></title-element>
            <input-element
                id="ssid"
                type="text"
                label="SSID"
                value="${this.ssid}"
            ></input-element>
            <input-element
                id="password"
                type="password"
                label="Password"
            ></input-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${!1}"
                ></button-element>
                <button-element
                    name="Connect"
                    @click="${this.connect}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};k([h({type:String})],S.prototype,"ssid",2);k([h({type:Boolean})],S.prototype,"autoConnect",2);k([Y("#ssid")],S.prototype,"ssidElement",2);k([Y("#password")],S.prototype,"passwordElement",2);k([g()],S.prototype,"errorText",2);S=k([m("wifi-setup-page")],S);var $r=Object.defineProperty,gr=Object.getOwnPropertyDescriptor,ct=(n,e,t,s)=>{for(var r=s>1?void 0:s?gr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&$r(e,t,r),r};let ae=class extends v{render(){return p`
            <div
                class="${w({loader:!0,active:this.active})}"
            ></div>
        `}};ae.styles=[$`
            .loader.active {
                animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1)
                    infinite;
                background-color: var(--secondary-light);
            }
            .loader {
                height: 0.25rem;
            }

            @keyframes running-progress {
                0% {
                    width: 0%;
                    margin-left: 0px;
                    margin-right: 100%;
                }
                50% {
                    width: 75%;
                    margin-left: 25%;
                    margin-right: 0%;
                }
                100% {
                    width: 0%;
                    margin-left: 100%;
                    margin-right: 0;
                }
            }
        `];ct([h({type:Boolean})],ae.prototype,"active",2);ae=ct([m("loader-bar-element")],ae);var yr=Object.defineProperty,_r=Object.getOwnPropertyDescriptor,M=(n,e,t,s)=>{for(var r=s>1?void 0:s?_r(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&yr(e,t,r),r};let P=class extends v{constructor(){super(),this.currentDot=0,this.ssid="",this.autoConnect=!1,this.loading=!1,this.pageElements=[],this.onDotClick=t=>{const s=t.detail;this.currentDot=s};const e=new URLSearchParams(window.location.search).get("page");e&&(this.currentDot=parseInt(e)),this.updatePageElements()}next(n){if(this.currentDot=Math.min(this.currentDot+1,this.pageElements.length-1),n!=null&&n.detail.network){const e=n.detail.network;this.ssid=e.ssid,this.updatePageElements(),e.secure==7&&(this.autoConnect=!0,this.next())}}back(){this.currentDot=Math.max(this.currentDot-1,0)}updatePageElements(){this.pageElements=[p`<welcome-page @next="${this.next}"></welcome-page>`,p`<update-page
                @next="${this.next}"
                @back="${this.back}"
            ></update-page>`,p`<name-page
                @next="${this.next}"
                @back="${this.back}"
            ></name-page>`,p`<wifi-scanner-page
                @next="${this.next}"
                @back="${this.back}"
            ></wifi-scanner-page>`,p`<wifi-setup-page
                @next="${this.next}"
                @back="${this.back}"
                ssid="${this.ssid}"
                ?autoConnect="${this.autoConnect}"
            ></wifi-setup-page>`,p`<mqtt-page
                @next="${this.next}"
                @back="${this.back}"
            ></mqtt-page>`]}updated(){const n=new URLSearchParams(window.location.search);n.set("page",this.currentDot.toString()),window.history.replaceState({},"",`${window.location.pathname}?${n}`)}render(){return p`
            <header-element icon="🌱" title="PlantFi"></header-element>
            <loader-bar-element ?active="${this.loading}"></loader-bar-element>
            <dots-stepper-element
                numberOfDots="${this.pageElements.length}"
                currentDot="${this.currentDot}"
                @dotClicked="${this.onDotClick}"
            ></dots-stepper-element>
            <div class="page">${this.pageElements[this.currentDot]}</div>
        `}};P.styles=$`
        :host {
            align-items: center;
            row-gap: 1rem;
            width: 100%;
        }
        .page {
            padding: 0 1rem;
            max-width: 24rem;
            width: 100%;
            box-sizing: border-box;
        }
    `;M([g()],P.prototype,"currentDot",2);M([g()],P.prototype,"ssid",2);M([g()],P.prototype,"autoConnect",2);M([g()],P.prototype,"loading",2);M([g()],P.prototype,"pageElements",2);P=M([m("first-setup-screen")],P);
