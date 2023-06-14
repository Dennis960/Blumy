(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerpolicy&&(i.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?i.credentials="include":n.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const K=window,fe=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,_e=Symbol(),Ae=new WeakMap;class Re{constructor(e,t,r){if(this._$cssResult$=!0,r!==_e)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(fe&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=Ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Ae.set(t,e))}return e}toString(){return this.cssText}}const Ge=s=>new Re(typeof s=="string"?s:s+"",void 0,_e),_=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((r,n,i)=>r+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+s[i+1],s[0]);return new Re(t,s,_e)},Xe=(s,e)=>{fe?s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{const r=document.createElement("style"),n=K.litNonce;n!==void 0&&r.setAttribute("nonce",n),r.textContent=t.cssText,s.appendChild(r)})},Ee=fe?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return Ge(t)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var re;const Z=window,xe=Z.trustedTypes,et=xe?xe.emptyScript:"",Pe=Z.reactiveElementPolyfillSupport,he={toAttribute(s,e){switch(e){case Boolean:s=s?et:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Be=(s,e)=>e!==s&&(e==e||s==s),se={attribute:!0,type:String,converter:he,reflect:!1,hasChanged:Be},pe="finalized";class x extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,r)=>{const n=this._$Ep(r,t);n!==void 0&&(this._$Ev.set(n,r),e.push(n))}),e}static createProperty(e,t=se){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const r=typeof e=="symbol"?Symbol():"__"+e,n=this.getPropertyDescriptor(e,r,t);n!==void 0&&Object.defineProperty(this.prototype,e,n)}}static getPropertyDescriptor(e,t,r){return{get(){return this[t]},set(n){const i=this[e];this[t]=n,this.requestUpdate(e,i,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||se}static finalize(){if(this.hasOwnProperty(pe))return!1;this[pe]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,r=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const n of r)this.createProperty(n,t[n])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const n of r)t.unshift(Ee(n))}else e!==void 0&&t.push(Ee(e));return t}static _$Ep(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,r;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((r=e.hostConnected)===null||r===void 0||r.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return Xe(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var r;return(r=t.hostConnected)===null||r===void 0?void 0:r.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var r;return(r=t.hostDisconnected)===null||r===void 0?void 0:r.call(t)})}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$EO(e,t,r=se){var n;const i=this.constructor._$Ep(e,r);if(i!==void 0&&r.reflect===!0){const o=(((n=r.converter)===null||n===void 0?void 0:n.toAttribute)!==void 0?r.converter:he).toAttribute(t,r.type);this._$El=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$El=null}}_$AK(e,t){var r;const n=this.constructor,i=n._$Ev.get(e);if(i!==void 0&&this._$El!==i){const o=n.getPropertyOptions(i),p=typeof o.converter=="function"?{fromAttribute:o.converter}:((r=o.converter)===null||r===void 0?void 0:r.fromAttribute)!==void 0?o.converter:he;this._$El=i,this[i]=p.fromAttribute(t,o.type),this._$El=null}}requestUpdate(e,t,r){let n=!0;e!==void 0&&(((r=r||this.constructor.getPropertyOptions(e)).hasChanged||Be)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),r.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,r))):n=!1),!this.isUpdatePending&&n&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((n,i)=>this[i]=n),this._$Ei=void 0);let t=!1;const r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),(e=this._$ES)===null||e===void 0||e.forEach(n=>{var i;return(i=n.hostUpdate)===null||i===void 0?void 0:i.call(n)}),this.update(r)):this._$Ek()}catch(n){throw t=!1,this._$Ek(),n}t&&this._$AE(r)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(r=>{var n;return(n=r.hostUpdated)===null||n===void 0?void 0:n.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,r)=>this._$EO(r,this[r],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}x[pe]=!0,x.elementProperties=new Map,x.elementStyles=[],x.shadowRootOptions={mode:"open"},Pe==null||Pe({ReactiveElement:x}),((re=Z.reactiveElementVersions)!==null&&re!==void 0?re:Z.reactiveElementVersions=[]).push("1.6.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ie;const J=window,P=J.trustedTypes,Se=P?P.createPolicy("lit-html",{createHTML:s=>s}):void 0,ue="$lit$",b=`lit$${(Math.random()+"").slice(9)}$`,Le="?"+b,tt=`<${Le}>`,E=document,j=()=>E.createComment(""),N=s=>s===null||typeof s!="object"&&typeof s!="function",ke=Array.isArray,nt=s=>ke(s)||typeof(s==null?void 0:s[Symbol.iterator])=="function",oe=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Oe=/-->/g,Ce=/>/g,w=RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),De=/'/g,Te=/"/g,ze=/^(?:script|style|textarea|title)$/i,rt=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),h=rt(1),g=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),je=new WeakMap,A=E.createTreeWalker(E,129,null,!1),st=(s,e)=>{const t=s.length-1,r=[];let n,i=e===2?"<svg>":"",o=T;for(let l=0;l<t;l++){const a=s[l];let y,c,d=-1,f=0;for(;f<a.length&&(o.lastIndex=f,c=o.exec(a),c!==null);)f=o.lastIndex,o===T?c[1]==="!--"?o=Oe:c[1]!==void 0?o=Ce:c[2]!==void 0?(ze.test(c[2])&&(n=RegExp("</"+c[2],"g")),o=w):c[3]!==void 0&&(o=w):o===w?c[0]===">"?(o=n!=null?n:T,d=-1):c[1]===void 0?d=-2:(d=o.lastIndex-c[2].length,y=c[1],o=c[3]===void 0?w:c[3]==='"'?Te:De):o===Te||o===De?o=w:o===Oe||o===Ce?o=T:(o=w,n=void 0);const q=o===w&&s[l+1].startsWith("/>")?" ":"";i+=o===T?a+tt:d>=0?(r.push(y),a.slice(0,d)+ue+a.slice(d)+b+q):a+b+(d===-2?(r.push(void 0),l):q)}const p=i+(s[t]||"<?>")+(e===2?"</svg>":"");if(!Array.isArray(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return[Se!==void 0?Se.createHTML(p):p,r]};class U{constructor({strings:e,_$litType$:t},r){let n;this.parts=[];let i=0,o=0;const p=e.length-1,l=this.parts,[a,y]=st(e,t);if(this.el=U.createElement(a,r),A.currentNode=this.el.content,t===2){const c=this.el.content,d=c.firstChild;d.remove(),c.append(...d.childNodes)}for(;(n=A.nextNode())!==null&&l.length<p;){if(n.nodeType===1){if(n.hasAttributes()){const c=[];for(const d of n.getAttributeNames())if(d.endsWith(ue)||d.startsWith(b)){const f=y[o++];if(c.push(d),f!==void 0){const q=n.getAttribute(f.toLowerCase()+ue).split(b),F=/([.?@])?(.*)/.exec(f);l.push({type:1,index:i,name:F[2],strings:q,ctor:F[1]==="."?ot:F[1]==="?"?at:F[1]==="@"?ct:X})}else l.push({type:6,index:i})}for(const d of c)n.removeAttribute(d)}if(ze.test(n.tagName)){const c=n.textContent.split(b),d=c.length-1;if(d>0){n.textContent=P?P.emptyScript:"";for(let f=0;f<d;f++)n.append(c[f],j()),A.nextNode(),l.push({type:2,index:++i});n.append(c[d],j())}}}else if(n.nodeType===8)if(n.data===Le)l.push({type:2,index:i});else{let c=-1;for(;(c=n.data.indexOf(b,c+1))!==-1;)l.push({type:7,index:i}),c+=b.length-1}i++}}static createElement(e,t){const r=E.createElement("template");return r.innerHTML=e,r}}function S(s,e,t=s,r){var n,i,o,p;if(e===g)return e;let l=r!==void 0?(n=t._$Co)===null||n===void 0?void 0:n[r]:t._$Cl;const a=N(e)?void 0:e._$litDirective$;return(l==null?void 0:l.constructor)!==a&&((i=l==null?void 0:l._$AO)===null||i===void 0||i.call(l,!1),a===void 0?l=void 0:(l=new a(s),l._$AT(s,t,r)),r!==void 0?((o=(p=t)._$Co)!==null&&o!==void 0?o:p._$Co=[])[r]=l:t._$Cl=l),l!==void 0&&(e=S(s,l._$AS(s,e.values),l,r)),e}class it{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:r},parts:n}=this._$AD,i=((t=e==null?void 0:e.creationScope)!==null&&t!==void 0?t:E).importNode(r,!0);A.currentNode=i;let o=A.nextNode(),p=0,l=0,a=n[0];for(;a!==void 0;){if(p===a.index){let y;a.type===2?y=new W(o,o.nextSibling,this,e):a.type===1?y=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(y=new ht(o,this,e)),this._$AV.push(y),a=n[++l]}p!==(a==null?void 0:a.index)&&(o=A.nextNode(),p++)}return A.currentNode=E,i}v(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}}class W{constructor(e,t,r,n){var i;this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=n,this._$Cp=(i=n==null?void 0:n.isConnected)===null||i===void 0||i}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=S(this,e,t),N(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==g&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):nt(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==m&&N(this._$AH)?this._$AA.nextSibling.data=e:this.$(E.createTextNode(e)),this._$AH=e}g(e){var t;const{values:r,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=U.createElement(n.h,this.options)),n);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===i)this._$AH.v(r);else{const o=new it(i,this),p=o.u(this.options);o.v(r),this.$(p),this._$AH=o}}_$AC(e){let t=je.get(e.strings);return t===void 0&&je.set(e.strings,t=new U(e)),t}T(e){ke(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,n=0;for(const i of e)n===t.length?t.push(r=new W(this.k(j()),this.k(j()),this,this.options)):r=t[n],r._$AI(i),n++;n<t.length&&(this._$AR(r&&r._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){var r;for((r=this._$AP)===null||r===void 0||r.call(this,!1,!0,t);e&&e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}}class X{constructor(e,t,r,n,i){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=m}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,r,n){const i=this.strings;let o=!1;if(i===void 0)e=S(this,e,t,0),o=!N(e)||e!==this._$AH&&e!==g,o&&(this._$AH=e);else{const p=e;let l,a;for(e=i[0],l=0;l<i.length-1;l++)a=S(this,p[r+l],t,l),a===g&&(a=this._$AH[l]),o||(o=!N(a)||a!==this._$AH[l]),a===m?e=m:e!==m&&(e+=(a!=null?a:"")+i[l+1]),this._$AH[l]=a}o&&!n&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e!=null?e:"")}}class ot extends X{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}const lt=P?P.emptyScript:"";class at extends X{constructor(){super(...arguments),this.type=4}j(e){e&&e!==m?this.element.setAttribute(this.name,lt):this.element.removeAttribute(this.name)}}class ct extends X{constructor(e,t,r,n,i){super(e,t,r,n,i),this.type=5}_$AI(e,t=this){var r;if((e=(r=S(this,e,t,0))!==null&&r!==void 0?r:m)===g)return;const n=this._$AH,i=e===m&&n!==m||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==m&&(n===m||i);i&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,r;typeof this._$AH=="function"?this._$AH.call((r=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&r!==void 0?r:this.element,e):this._$AH.handleEvent(e)}}class ht{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){S(this,e)}}const Ne=J.litHtmlPolyfillSupport;Ne==null||Ne(U,W),((ie=J.litHtmlVersions)!==null&&ie!==void 0?ie:J.litHtmlVersions=[]).push("2.7.4");const pt=(s,e,t)=>{var r,n;const i=(r=t==null?void 0:t.renderBefore)!==null&&r!==void 0?r:e;let o=i._$litPart$;if(o===void 0){const p=(n=t==null?void 0:t.renderBefore)!==null&&n!==void 0?n:null;i._$litPart$=o=new W(e.insertBefore(j(),p),p,void 0,t!=null?t:{})}return o._$AI(s),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var le,ae;class $ extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const r=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=r.firstChild),r}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=pt(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return g}}$.finalized=!0,$._$litElement$=!0,(le=globalThis.litElementHydrateSupport)===null||le===void 0||le.call(globalThis,{LitElement:$});const Ue=globalThis.litElementPolyfillSupport;Ue==null||Ue({LitElement:$});((ae=globalThis.litElementVersions)!==null&&ae!==void 0?ae:globalThis.litElementVersions=[]).push("3.3.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ut=({finisher:s,descriptor:e})=>(t,r)=>{var n;if(r===void 0){const i=(n=t.originalKey)!==null&&n!==void 0?n:t.key,o=e!=null?{kind:"method",placement:"prototype",key:i,descriptor:e(t.key)}:{...t,key:i};return s!=null&&(o.finisher=function(p){s(p,i)}),o}{const i=t.constructor;e!==void 0&&Object.defineProperty(t,r,e(r)),s==null||s(i,r)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const v=s=>e=>typeof e=="function"?((t,r)=>(customElements.define(t,r),r))(s,e):((t,r)=>{const{kind:n,elements:i}=r;return{kind:n,elements:i,finisher(o){customElements.define(t,o)}}})(s,e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const dt=(s,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(t){t.createProperty(e.key,s)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,s)}},mt=(s,e,t)=>{e.constructor.createProperty(t,s)};function u(s){return(e,t)=>t!==void 0?mt(s,e,t):dt(s,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function V(s){return u({...s,state:!0})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function vt(s,e){return ut({descriptor:t=>{const r={get(){var n,i;return(i=(n=this.renderRoot)===null||n===void 0?void 0:n.querySelector(s))!==null&&i!==void 0?i:null},enumerable:!0,configurable:!0};if(e){const n=typeof t=="symbol"?Symbol():"__"+t;r.get=function(){var i,o;return this[n]===void 0&&(this[n]=(o=(i=this.renderRoot)===null||i===void 0?void 0:i.querySelector(s))!==null&&o!==void 0?o:null),this[n]}}return r}})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ce;((ce=window.HTMLSlotElement)===null||ce===void 0?void 0:ce.prototype.assignedElements)!=null;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.");var $t=Object.defineProperty,ft=Object.getOwnPropertyDescriptor,ye=(s,e,t,r)=>{for(var n=r>1?void 0:r?ft(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&$t(e,t,n),n};let H=class extends ${render(){return h`
            <span>${this.icon}</span>
            <div class="title">${this.title}</div>
        `}};H.styles=_`
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
    `;ye([u()],H.prototype,"title",2);ye([u()],H.prototype,"icon",2);H=ye([v("header-element")],H);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ie={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},We=s=>(...e)=>({_$litDirective$:s,values:e});class Ve{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qe=We(class extends Ve{constructor(s){var e;if(super(s),s.type!==Ie.ATTRIBUTE||s.name!=="class"||((e=s.strings)===null||e===void 0?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(s){return" "+Object.keys(s).filter(e=>s[e]).join(" ")+" "}update(s,[e]){var t,r;if(this.it===void 0){this.it=new Set,s.strings!==void 0&&(this.nt=new Set(s.strings.join(" ").split(/\s/).filter(i=>i!=="")));for(const i in e)e[i]&&!(!((t=this.nt)===null||t===void 0)&&t.has(i))&&this.it.add(i);return this.render(e)}const n=s.element.classList;this.it.forEach(i=>{i in e||(n.remove(i),this.it.delete(i))});for(const i in e){const o=!!e[i];o===this.it.has(i)||((r=this.nt)===null||r===void 0?void 0:r.has(i))||(o?(n.add(i),this.it.add(i)):(n.remove(i),this.it.delete(i)))}return g}});var _t=Object.defineProperty,yt=Object.getOwnPropertyDescriptor,C=(s,e,t,r)=>{for(var n=r>1?void 0:r?yt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&_t(e,t,n),n};let M=class extends ${click(){this.dispatchEvent(new CustomEvent("dotClicked"))}render(){const s={active:this.active,done:this.done};return h`<li class="dot">
            <button class=${qe(s)} @click="${this.click}"></button>
        </li>`}};M.styles=_`
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
    `;C([u({type:Boolean})],M.prototype,"active",2);C([u({type:Boolean})],M.prototype,"done",2);M=C([v("dot-element")],M);let R=class extends ${render(){return h`
            <ol>
                ${Array.from({length:this.numberOfDots},(s,e)=>h`<dot-element
                        ?active=${e===this.currentDot}
                        ?done=${e<this.currentDot}
                        @dotClicked="${()=>{this.dispatchEvent(new CustomEvent("dotClicked",{detail:e}))}}"
                    ></dot-element>`)}
            </ol>
        `}};R.styles=_`
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
    `;C([u({type:Number})],R.prototype,"numberOfDots",2);C([u({type:Number})],R.prototype,"currentDot",2);R=C([v("dots-stepper-element")],R);var bt=Object.defineProperty,gt=Object.getOwnPropertyDescriptor,be=(s,e,t,r)=>{for(var n=r>1?void 0:r?gt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&bt(e,t,n),n};let B=class extends ${render(){const s={secondary:this.secondary};return h`<button class=${qe(s)}>${this.name}</button>`}};B.styles=[_`
            button {
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem 0.75rem;
                margin: 0.25rem 0;
                cursor: pointer;
                font-size: 100%;
            }
            button.secondary {
                background-color: var(--secondary-base);
                color: var(--text-light);
            }
        `];be([u({type:Boolean})],B.prototype,"secondary",2);be([u({type:String})],B.prototype,"name",2);B=be([v("button-element")],B);var wt=Object.defineProperty,At=Object.getOwnPropertyDescriptor,Et=(s,e,t,r)=>{for(var n=r>1?void 0:r?At(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&wt(e,t,n),n};let de=class extends ${render(){return h`
            <div class="button-nav">
                <slot></slot>
            </div>
        `}};de.styles=[_`
            .button-nav {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                row-gap: 1rem;
            }
        `];de=Et([v("button-nav-element")],de);var xt=Object.defineProperty,Pt=Object.getOwnPropertyDescriptor,Fe=(s,e,t,r)=>{for(var n=r>1?void 0:r?Pt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&xt(e,t,n),n};let Q=class extends ${render(){return h`<div class="description">${this.description}</div>`}};Q.styles=[_`
            .description {
                margin-bottom: 0.75rem;
            }
        `];Fe([u({type:String})],Q.prototype,"description",2);Q=Fe([v("description-element")],Q);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ke="important",St=" !"+Ke,me=We(class extends Ve{constructor(s){var e;if(super(s),s.type!==Ie.ATTRIBUTE||s.name!=="style"||((e=s.strings)===null||e===void 0?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(s){return Object.keys(s).reduce((e,t)=>{const r=s[t];return r==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(s,[e]){const{style:t}=s.element;if(this.ut===void 0){this.ut=new Set;for(const r in e)this.ut.add(r);return this.render(e)}this.ut.forEach(r=>{e[r]==null&&(this.ut.delete(r),r.includes("-")?t.removeProperty(r):t[r]="")});for(const r in e){const n=e[r];if(n!=null){this.ut.add(r);const i=typeof n=="string"&&n.endsWith(St);r.includes("-")||i?t.setProperty(r,i?n.slice(0,-11):n,i?Ke:""):t[r]=n}}return g}});var Ot=Object.defineProperty,Ct=Object.getOwnPropertyDescriptor,Ze=(s,e,t,r)=>{for(var n=r>1?void 0:r?Ct(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Ot(e,t,n),n};let Y=class extends ${render(){return h`
            <div
                class="error-text"
                style="${me({display:this.text?"":"none"})}"
            >
                ${this.text}
            </div>
        `}};Y.styles=[_`
            .error-text {
                color: var(--error);
                margin-bottom: 0.75rem;
            }
        `];Ze([u({type:String})],Y.prototype,"text",2);Y=Ze([v("error-text-element")],Y);var Dt=Object.defineProperty,Tt=Object.getOwnPropertyDescriptor,ee=(s,e,t,r)=>{for(var n=r>1?void 0:r?Tt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Dt(e,t,n),n};let O=class extends ${constructor(){super(...arguments),this.type="text",this.onChange=s=>{const e=s.target;this.value=e.value,this.dispatchEvent(new CustomEvent("change",{detail:this.value}))}}render(){return h`
            <label for="input">${this.label}</label>
            <input id="input" type="${this.type}" placeholder="${this.label}" @change="${this.onChange}" />
        `}};O.styles=[_`
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
        `];ee([u({type:String})],O.prototype,"label",2);ee([u({type:String})],O.prototype,"type",2);ee([u({type:Object})],O.prototype,"value",2);O=ee([v("input-element")],O);var jt=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,Je=(s,e,t,r)=>{for(var n=r>1?void 0:r?Nt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&jt(e,t,n),n};let G=class extends ${render(){return h`<div class="title">${this.title}</div>`}};G.styles=[_`
            .title {
                font-size: 1.25rem;
                margin-bottom: 0.75rem;
            }
        `];Je([u({type:String})],G.prototype,"title",2);G=Je([v("title-element")],G);var Ut=Object.defineProperty,Ht=Object.getOwnPropertyDescriptor,ge=(s,e,t,r)=>{for(var n=r>1?void 0:r?Ht(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Ut(e,t,n),n};let L=class extends ${constructor(){super(...arguments),this.visible=!1,this.progress=0}render(){return h`
            <div class="progress-bar" style=${me({display:`${this.visible?"":"none"}`})}>
                <div
                    class="progress-bar-fill"
                    style=${me({width:`${this.progress}%`})}
                ></div>
            </div>
        `}};L.styles=[_`
            .progress-bar {
                grid-column: 1 / -1;
                display: none;
            }
            .progress-bar-fill {
                width: 0%;
                height: 0.25rem;
                background-color: var(--primary-base);
            }
        `];ge([u({type:Boolean})],L.prototype,"visible",2);ge([u({type:Number})],L.prototype,"progress",2);L=ge([v("progress-bar-element")],L);class D extends ${back(){this.dispatchEvent(new CustomEvent("back"))}next(){this.dispatchEvent(new CustomEvent("next"))}}var Mt=Object.defineProperty,Rt=Object.getOwnPropertyDescriptor,Qe=(s,e,t,r)=>{for(var n=r>1?void 0:r?Rt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Mt(e,t,n),n};let ve=class extends D{render(){return h`
            <title-element title="Welcome"></title-element>
            <description-element
                description="${`PlantFi is currently ${this.onlineStatus}. Start the setup
                    to connect it to a WiFi network`}"
            ></description-element>
            <button-nav-element>
                <button-element
                    name="Start Setup"
                    @click="${this.next}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};Qe([u({type:String})],ve.prototype,"onlineStatus",2);ve=Qe([v("welcome-page")],ve);async function Bt(s,e){return await fetch(s,{method:"POST",body:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})}async function Lt(s){return await fetch(s).then(e=>e.json()).catch(e=>(console.error(e),null))}async function kt(s){const e=new URLSearchParams;return e.append("name",s),await Bt("/plantName",e)}async function zt(){return await Lt("/networks")}var It=Object.defineProperty,Wt=Object.getOwnPropertyDescriptor,te=(s,e,t,r)=>{for(var n=r>1?void 0:r?Wt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&It(e,t,n),n};let k=class extends D{constructor(){super(...arguments),this.errorText=""}async submit(){var t;const s=(t=this.nameElement.value)!=null?t:"";if(s.length<1||s.length>32){this.errorText="Name must be between 1 and 32 characters";return}else this.errorText="";if(!(await kt(s)).ok){this.errorText="Error setting plant name";return}}render(){return h`
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
        `}};te([u({type:String})],k.prototype,"onlineStatus",2);te([vt("#name")],k.prototype,"nameElement",2);te([V()],k.prototype,"errorText",2);k=te([v("name-page")],k);var Vt=Object.defineProperty,qt=Object.getOwnPropertyDescriptor,ne=(s,e,t,r)=>{for(var n=r>1?void 0:r?qt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Vt(e,t,n),n};let z=class extends D{constructor(){super(),this.errorText="",this.networks=[],(async()=>{const s=await zt();s==null&&(this.errorText="Error getting networks")})()}render(){return h`
            <title-element title="Select WiFi Network"></title-element>
            <description-element
                description="Available WiFi Networks:"
            ></description-element>
            <error-text-element text="${this.errorText}"></error-text-element>
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
        `}};ne([u({type:String})],z.prototype,"onlineStatus",2);ne([V()],z.prototype,"errorText",2);ne([V()],z.prototype,"networks",2);z=ne([v("wifi-scanner-page")],z);var Ft=Object.defineProperty,Kt=Object.getOwnPropertyDescriptor,Zt=(s,e,t,r)=>{for(var n=r>1?void 0:r?Kt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Ft(e,t,n),n};let He=class extends D{render(){return h`
            <title-element title="Enter WiFi Credentials"></title-element>
            <input-element type="text" label="SSID"></input-element>
            <input-element type="password" label="Password"></input-element>
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
        `}};He=Zt([v("wifi-setup-page")],He);var Jt=Object.defineProperty,Qt=Object.getOwnPropertyDescriptor,Ye=(s,e,t,r)=>{for(var n=r>1?void 0:r?Qt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Jt(e,t,n),n};let $e=class extends D{upload(){}render(){return h`
            <title-element title="Update Firmware"></title-element>
            <input-element label="littlefs.bin" type="file"></input-element>
            <progress-bar-element
                ?visible="${!0}"
                progress="50"
            ></progress-bar-element>
            <input-element label="firmware.bin" type="file"></input-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${!1}"
                ></button-element>
                <button-element
                    name="Upload"
                    @click="${this.upload}"
                    ?secondary="${!0}"
                ></button-element>
                <button-element
                    name="Skip"
                    @click="${this.next}"
                    ?secondary="${!0}"
                ></button-element>
            </button-nav-element>
        `}};Ye([u({type:String})],$e.prototype,"onlineStatus",2);$e=Ye([v("update-page")],$e);var Yt=Object.defineProperty,Gt=Object.getOwnPropertyDescriptor,Xt=(s,e,t,r)=>{for(var n=r>1?void 0:r?Gt(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&Yt(e,t,n),n};let Me=class extends D{render(){return h`
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
        `}};Me=Xt([v("mqtt-page")],Me);var en=Object.defineProperty,tn=Object.getOwnPropertyDescriptor,we=(s,e,t,r)=>{for(var n=r>1?void 0:r?tn(e,t):e,i=s.length-1,o;i>=0;i--)(o=s[i])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&en(e,t,n),n};let I=class extends ${constructor(){super(...arguments),this.currentDot=0,this.onlineStatus="offline",this.onTestClick=()=>{console.log("test")},this.next=()=>{this.currentDot=Math.min(this.currentDot+1,this.pageElements.length-1)},this.back=()=>{this.currentDot=Math.max(this.currentDot-1,0)},this.onDotClick=s=>{const e=s.detail;this.currentDot=e},this.pageElements=[h`<welcome-page
            @next="${this.next}"
            onlineStatus="${this.onlineStatus}"
        ></welcome-page>`,h`<update-page
            @next="${this.next}"
            @back="${this.back}"
        ></update-page>`,h`<name-page @next="${this.next}" @back="${this.back}"></name-page>`,h`<wifi-scanner-page
            @next="${this.next}"
            @back="${this.back}"
        ></wifi-scanner-page>`,h`<wifi-setup-page
            @next="${this.next}"
            @back="${this.back}"
        ></wifi-setup-page>`,h`<mqtt-page
            @next="${this.next}"
            @back="${this.back}"
        ></mqtt-page>`]}render(){return h`
            <header-element icon="🌱" title="PlantFi"></header-element>
            <dots-stepper-element
                numberOfDots="${this.pageElements.length}"
                currentDot="${this.currentDot}"
                @dotClicked="${this.onDotClick}"
            ></dots-stepper-element>
            <div class="page">${this.pageElements[this.currentDot]}</div>
        `}};I.styles=_`
        :host {
            display: flex;
            flex-direction: column;
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
    `;we([V()],I.prototype,"currentDot",2);we([V()],I.prototype,"onlineStatus",2);I=we([v("first-setup-screen")],I);
