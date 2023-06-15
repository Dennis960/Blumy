var ft=Object.defineProperty;var $t=(n,e,t)=>e in n?ft(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var b=(n,e,t)=>($t(n,typeof e!="symbol"?e+"":e,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te=window,De=te.ShadowRoot&&(te.ShadyCSS===void 0||te.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ne=Symbol(),Le=new WeakMap;class Xe{constructor(e,t,s){if(this._$cssResult$=!0,s!==Ne)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(De&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=Le.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Le.set(t,e))}return e}toString(){return this.cssText}}const gt=n=>new Xe(typeof n=="string"?n:n+"",void 0,Ne),$=(n,...e)=>{const t=n.length===1?n[0]:e.reduce((s,r,i)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+n[i+1],n[0]);return new Xe(t,n,Ne)},yt=(n,e)=>{De?n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{const s=document.createElement("style"),r=te.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,n.appendChild(s)})},He=De?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return gt(t)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var fe;const se=window,Ie=se.trustedTypes,_t=Ie?Ie.emptyScript:"",Be=se.reactiveElementPolyfillSupport,Ee={toAttribute(n,e){switch(e){case Boolean:n=n?_t:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},et=(n,e)=>e!==n&&(e==e||n==n),$e={attribute:!0,type:String,converter:Ee,reflect:!1,hasChanged:et},Pe="finalized";class D extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,s)=>{const r=this._$Ep(s,t);r!==void 0&&(this._$Ev.set(r,s),e.push(r))}),e}static createProperty(e,t=$e){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const s=typeof e=="symbol"?Symbol():"__"+e,r=this.getPropertyDescriptor(e,s,t);r!==void 0&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){return{get(){return this[t]},set(r){const i=this[e];this[t]=r,this.requestUpdate(e,i,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||$e}static finalize(){if(this.hasOwnProperty(Pe))return!1;this[Pe]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,s=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const r of s)this.createProperty(r,t[r])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(He(r))}else e!==void 0&&t.push(He(e));return t}static _$Ep(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,s;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((s=e.hostConnected)===null||s===void 0||s.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return yt(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var s;return(s=t.hostConnected)===null||s===void 0?void 0:s.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var s;return(s=t.hostDisconnected)===null||s===void 0?void 0:s.call(t)})}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$EO(e,t,s=$e){var r;const i=this.constructor._$Ep(e,s);if(i!==void 0&&s.reflect===!0){const o=(((r=s.converter)===null||r===void 0?void 0:r.toAttribute)!==void 0?s.converter:Ee).toAttribute(t,s.type);this._$El=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$El=null}}_$AK(e,t){var s;const r=this.constructor,i=r._$Ev.get(e);if(i!==void 0&&this._$El!==i){const o=r.getPropertyOptions(i),h=typeof o.converter=="function"?{fromAttribute:o.converter}:((s=o.converter)===null||s===void 0?void 0:s.fromAttribute)!==void 0?o.converter:Ee;this._$El=i,this[i]=h.fromAttribute(t,o.type),this._$El=null}}requestUpdate(e,t,s){let r=!0;e!==void 0&&(((s=s||this.constructor.getPropertyOptions(e)).hasChanged||et)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),s.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,s))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((r,i)=>this[i]=r),this._$Ei=void 0);let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),(e=this._$ES)===null||e===void 0||e.forEach(r=>{var i;return(i=r.hostUpdate)===null||i===void 0?void 0:i.call(r)}),this.update(s)):this._$Ek()}catch(r){throw t=!1,this._$Ek(),r}t&&this._$AE(s)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(s=>{var r;return(r=s.hostUpdated)===null||r===void 0?void 0:r.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,s)=>this._$EO(s,this[s],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}D[Pe]=!0,D.elementProperties=new Map,D.elementStyles=[],D.shadowRootOptions={mode:"open"},Be==null||Be({ReactiveElement:D}),((fe=se.reactiveElementVersions)!==null&&fe!==void 0?fe:se.reactiveElementVersions=[]).push("1.6.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ge;const ne=window,j=ne.trustedTypes,ze=j?j.createPolicy("lit-html",{createHTML:n=>n}):void 0,xe="$lit$",w=`lit$${(Math.random()+"").slice(9)}$`,tt="?"+w,bt=`<${tt}>`,S=document,I=()=>S.createComment(""),B=n=>n===null||typeof n!="object"&&typeof n!="function",rt=Array.isArray,wt=n=>rt(n)||typeof(n==null?void 0:n[Symbol.iterator])=="function",ye=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ve=/-->/g,Fe=/>/g,O=RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),qe=/'/g,We=/"/g,st=/^(?:script|style|textarea|title)$/i,Et=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),c=Et(1),P=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),Ke=new WeakMap,C=S.createTreeWalker(S,129,null,!1),Pt=(n,e)=>{const t=n.length-1,s=[];let r,i=e===2?"<svg>":"",o=H;for(let l=0;l<t;l++){const a=n[l];let _,p,m=-1,y=0;for(;y<a.length&&(o.lastIndex=y,p=o.exec(a),p!==null);)y=o.lastIndex,o===H?p[1]==="!--"?o=Ve:p[1]!==void 0?o=Fe:p[2]!==void 0?(st.test(p[2])&&(r=RegExp("</"+p[2],"g")),o=O):p[3]!==void 0&&(o=O):o===O?p[0]===">"?(o=r!=null?r:H,m=-1):p[1]===void 0?m=-2:(m=o.lastIndex-p[2].length,_=p[1],o=p[3]===void 0?O:p[3]==='"'?We:qe):o===We||o===qe?o=O:o===Ve||o===Fe?o=H:(o=O,r=void 0);const X=o===O&&n[l+1].startsWith("/>")?" ":"";i+=o===H?a+bt:m>=0?(s.push(_),a.slice(0,m)+xe+a.slice(m)+w+X):a+w+(m===-2?(s.push(void 0),l):X)}const h=i+(n[t]||"<?>")+(e===2?"</svg>":"");if(!Array.isArray(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return[ze!==void 0?ze.createHTML(h):h,s]};class z{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let i=0,o=0;const h=e.length-1,l=this.parts,[a,_]=Pt(e,t);if(this.el=z.createElement(a,s),C.currentNode=this.el.content,t===2){const p=this.el.content,m=p.firstChild;m.remove(),p.append(...m.childNodes)}for(;(r=C.nextNode())!==null&&l.length<h;){if(r.nodeType===1){if(r.hasAttributes()){const p=[];for(const m of r.getAttributeNames())if(m.endsWith(xe)||m.startsWith(w)){const y=_[o++];if(p.push(m),y!==void 0){const X=r.getAttribute(y.toLowerCase()+xe).split(w),ee=/([.?@])?(.*)/.exec(y);l.push({type:1,index:i,name:ee[2],strings:X,ctor:ee[1]==="."?At:ee[1]==="?"?Ct:ee[1]==="@"?St:he})}else l.push({type:6,index:i})}for(const m of p)r.removeAttribute(m)}if(st.test(r.tagName)){const p=r.textContent.split(w),m=p.length-1;if(m>0){r.textContent=j?j.emptyScript:"";for(let y=0;y<m;y++)r.append(p[y],I()),C.nextNode(),l.push({type:2,index:++i});r.append(p[m],I())}}}else if(r.nodeType===8)if(r.data===tt)l.push({type:2,index:i});else{let p=-1;for(;(p=r.data.indexOf(w,p+1))!==-1;)l.push({type:7,index:i}),p+=w.length-1}i++}}static createElement(e,t){const s=S.createElement("template");return s.innerHTML=e,s}}function U(n,e,t=n,s){var r,i,o,h;if(e===P)return e;let l=s!==void 0?(r=t._$Co)===null||r===void 0?void 0:r[s]:t._$Cl;const a=B(e)?void 0:e._$litDirective$;return(l==null?void 0:l.constructor)!==a&&((i=l==null?void 0:l._$AO)===null||i===void 0||i.call(l,!1),a===void 0?l=void 0:(l=new a(n),l._$AT(n,t,s)),s!==void 0?((o=(h=t)._$Co)!==null&&o!==void 0?o:h._$Co=[])[s]=l:t._$Cl=l),l!==void 0&&(e=U(n,l._$AS(n,e.values),l,s)),e}class xt{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:s},parts:r}=this._$AD,i=((t=e==null?void 0:e.creationScope)!==null&&t!==void 0?t:S).importNode(s,!0);C.currentNode=i;let o=C.nextNode(),h=0,l=0,a=r[0];for(;a!==void 0;){if(h===a.index){let _;a.type===2?_=new Y(o,o.nextSibling,this,e):a.type===1?_=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(_=new Tt(o,this,e)),this._$AV.push(_),a=r[++l]}h!==(a==null?void 0:a.index)&&(o=C.nextNode(),h++)}return C.currentNode=S,i}v(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class Y{constructor(e,t,s,r){var i;this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cp=(i=r==null?void 0:r.isConnected)===null||i===void 0||i}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=U(this,e,t),B(e)?e===f||e==null||e===""?(this._$AH!==f&&this._$AR(),this._$AH=f):e!==this._$AH&&e!==P&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):wt(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==f&&B(this._$AH)?this._$AA.nextSibling.data=e:this.$(S.createTextNode(e)),this._$AH=e}g(e){var t;const{values:s,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=z.createElement(r.h,this.options)),r);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===i)this._$AH.v(s);else{const o=new xt(i,this),h=o.u(this.options);o.v(s),this.$(h),this._$AH=o}}_$AC(e){let t=Ke.get(e.strings);return t===void 0&&Ke.set(e.strings,t=new z(e)),t}T(e){rt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const i of e)r===t.length?t.push(s=new Y(this.k(I()),this.k(I()),this,this.options)):s=t[r],s._$AI(i),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,t);e&&e!==this._$AB;){const r=e.nextSibling;e.remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}}class he{constructor(e,t,s,r,i){this.type=1,this._$AH=f,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=f}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,s,r){const i=this.strings;let o=!1;if(i===void 0)e=U(this,e,t,0),o=!B(e)||e!==this._$AH&&e!==P,o&&(this._$AH=e);else{const h=e;let l,a;for(e=i[0],l=0;l<i.length-1;l++)a=U(this,h[s+l],t,l),a===P&&(a=this._$AH[l]),o||(o=!B(a)||a!==this._$AH[l]),a===f?e=f:e!==f&&(e+=(a!=null?a:"")+i[l+1]),this._$AH[l]=a}o&&!r&&this.j(e)}j(e){e===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e!=null?e:"")}}class At extends he{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===f?void 0:e}}const Ot=j?j.emptyScript:"";class Ct extends he{constructor(){super(...arguments),this.type=4}j(e){e&&e!==f?this.element.setAttribute(this.name,Ot):this.element.removeAttribute(this.name)}}class St extends he{constructor(e,t,s,r,i){super(e,t,s,r,i),this.type=5}_$AI(e,t=this){var s;if((e=(s=U(this,e,t,0))!==null&&s!==void 0?s:f)===P)return;const r=this._$AH,i=e===f&&r!==f||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==f&&(r===f||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,s;typeof this._$AH=="function"?this._$AH.call((s=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&s!==void 0?s:this.element,e):this._$AH.handleEvent(e)}}class Tt{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){U(this,e)}}const Ge=ne.litHtmlPolyfillSupport;Ge==null||Ge(z,Y),((ge=ne.litHtmlVersions)!==null&&ge!==void 0?ge:ne.litHtmlVersions=[]).push("2.7.4");const Dt=(n,e,t)=>{var s,r;const i=(s=t==null?void 0:t.renderBefore)!==null&&s!==void 0?s:e;let o=i._$litPart$;if(o===void 0){const h=(r=t==null?void 0:t.renderBefore)!==null&&r!==void 0?r:null;i._$litPart$=o=new Y(e.insertBefore(I(),h),h,void 0,t!=null?t:{})}return o._$AI(n),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var _e,be;class v extends D{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const s=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=s.firstChild),s}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Dt(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return P}}v.finalized=!0,v._$litElement$=!0,(_e=globalThis.litElementHydrateSupport)===null||_e===void 0||_e.call(globalThis,{LitElement:v});const Ze=globalThis.litElementPolyfillSupport;Ze==null||Ze({LitElement:v});((be=globalThis.litElementVersions)!==null&&be!==void 0?be:globalThis.litElementVersions=[]).push("3.3.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Nt=({finisher:n,descriptor:e})=>(t,s)=>{var r;if(s===void 0){const i=(r=t.originalKey)!==null&&r!==void 0?r:t.key,o=e!=null?{kind:"method",placement:"prototype",key:i,descriptor:e(t.key)}:{...t,key:i};return n!=null&&(o.finisher=function(h){n(h,i)}),o}{const i=t.constructor;e!==void 0&&Object.defineProperty(t,s,e(s)),n==null||n(i,s)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const d=n=>e=>typeof e=="function"?((t,s)=>(customElements.define(t,s),s))(n,e):((t,s)=>{const{kind:r,elements:i}=s;return{kind:r,elements:i,finisher(o){customElements.define(t,o)}}})(n,e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const jt=(n,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(t){t.createProperty(e.key,n)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,n)}},Ut=(n,e,t)=>{e.constructor.createProperty(t,n)};function u(n){return(e,t)=>t!==void 0?Ut(n,e,t):jt(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function g(n){return u({...n,state:!0})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Q(n,e){return Nt({descriptor:t=>{const s={get(){var r,i;return(i=(r=this.renderRoot)===null||r===void 0?void 0:r.querySelector(n))!==null&&i!==void 0?i:null},enumerable:!0,configurable:!0};if(e){const r=typeof t=="symbol"?Symbol():"__"+t;s.get=function(){var i,o;return this[r]===void 0&&(this[r]=(o=(i=this.renderRoot)===null||i===void 0?void 0:i.querySelector(n))!==null&&o!==void 0?o:null),this[r]}}return s}})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var we;((we=window.HTMLSlotElement)===null||we===void 0?void 0:we.prototype.assignedElements)!=null;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const nt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},it=n=>(...e)=>({_$litDirective$:n,values:e});class ot{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const E=it(class extends ot{constructor(n){var e;if(super(n),n.type!==nt.ATTRIBUTE||n.name!=="class"||((e=n.strings)===null||e===void 0?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(e=>n[e]).join(" ")+" "}update(n,[e]){var t,s;if(this.it===void 0){this.it=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(i=>i!=="")));for(const i in e)e[i]&&!(!((t=this.nt)===null||t===void 0)&&t.has(i))&&this.it.add(i);return this.render(e)}const r=n.element.classList;this.it.forEach(i=>{i in e||(r.remove(i),this.it.delete(i))});for(const i in e){const o=!!e[i];o===this.it.has(i)||((s=this.nt)===null||s===void 0?void 0:s.has(i))||(o?(r.add(i),this.it.add(i)):(r.remove(i),this.it.delete(i)))}return P}});var Rt=Object.defineProperty,Mt=Object.getOwnPropertyDescriptor,M=(n,e,t,s)=>{for(var r=s>1?void 0:s?Mt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Rt(e,t,r),r};let V=class extends v{click(){this.dispatchEvent(new CustomEvent("dotClicked"))}render(){const n={active:this.active,done:this.done};return c`<li class="dot">
            <button class=${E(n)} @click="${this.click}"></button>
        </li>`}};V.styles=$`
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
    `;M([u({type:Boolean})],V.prototype,"active",2);M([u({type:Boolean})],V.prototype,"done",2);V=M([d("dot-element")],V);let F=class extends v{render(){return c`
            <ol>
                ${Array.from({length:this.numberOfDots},(n,e)=>c`<dot-element
                        ?active=${e===this.currentDot}
                        ?done=${e<this.currentDot}
                        @dotClicked="${()=>{this.dispatchEvent(new CustomEvent("dotClicked",{detail:e}))}}"
                    ></dot-element>`)}
            </ol>
        `}};F.styles=$`
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
    `;M([u({type:Number})],F.prototype,"numberOfDots",2);M([u({type:Number})],F.prototype,"currentDot",2);F=M([d("dots-stepper-element")],F);var kt=Object.defineProperty,Lt=Object.getOwnPropertyDescriptor,je=(n,e,t,s)=>{for(var r=s>1?void 0:s?Lt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&kt(e,t,r),r};let q=class extends v{render(){return c`
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
    `;je([u()],q.prototype,"title",2);je([u()],q.prototype,"icon",2);q=je([d("header-element")],q);var Ht=Object.defineProperty,It=Object.getOwnPropertyDescriptor,lt=(n,e,t,s)=>{for(var r=s>1?void 0:s?It(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Ht(e,t,r),r};let ie=class extends v{render(){return c`
            <div
                class="${E({loader:!0,active:this.active})}"
            ></div>
        `}};ie.styles=[$`
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
        `];lt([u({type:Boolean})],ie.prototype,"active",2);ie=lt([d("loader-bar-element")],ie);var Bt=Object.defineProperty,zt=Object.getOwnPropertyDescriptor,Ue=(n,e,t,s)=>{for(var r=s>1?void 0:s?zt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Bt(e,t,r),r};let W=class extends v{render(){const n={secondary:this.secondary};return c`
            <button class=${E(n)}>
                <slot></slot>${this.name}
            </button>
        `}};W.styles=[$`
            button {
                width: 100%;
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem 0.75rem;
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
        `];Ue([u({type:Boolean})],W.prototype,"secondary",2);Ue([u({type:String})],W.prototype,"name",2);W=Ue([d("button-element")],W);var Vt=Object.defineProperty,Ft=Object.getOwnPropertyDescriptor,qt=(n,e,t,s)=>{for(var r=s>1?void 0:s?Ft(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Vt(e,t,r),r};let Ae=class extends v{render(){return c`
            <div class="button-nav">
                <slot></slot>
            </div>
        `}};Ae.styles=[$`
            .button-nav {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                row-gap: 1rem;
            }
        `];Ae=qt([d("button-nav-element")],Ae);var Wt=Object.defineProperty,Kt=Object.getOwnPropertyDescriptor,at=(n,e,t,s)=>{for(var r=s>1?void 0:s?Kt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Wt(e,t,r),r};let oe=class extends v{render(){return c`<div class="description">${this.description}</div>`}};oe.styles=[$`
            .description {
                margin-bottom: 0.75rem;
            }
        `];at([u({type:String})],oe.prototype,"description",2);oe=at([d("description-element")],oe);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ct="important",Gt=" !"+ct,Oe=it(class extends ot{constructor(n){var e;if(super(n),n.type!==nt.ATTRIBUTE||n.name!=="style"||((e=n.strings)===null||e===void 0?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(n){return Object.keys(n).reduce((e,t)=>{const s=n[t];return s==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(n,[e]){const{style:t}=n.element;if(this.ut===void 0){this.ut=new Set;for(const s in e)this.ut.add(s);return this.render(e)}this.ut.forEach(s=>{e[s]==null&&(this.ut.delete(s),s.includes("-")?t.removeProperty(s):t[s]="")});for(const s in e){const r=e[s];if(r!=null){this.ut.add(s);const i=typeof r=="string"&&r.endsWith(Gt);s.includes("-")||i?t.setProperty(s,i?r.slice(0,-11):r,i?ct:""):t[s]=r}}return P}});var Zt=Object.defineProperty,Jt=Object.getOwnPropertyDescriptor,pt=(n,e,t,s)=>{for(var r=s>1?void 0:s?Jt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Zt(e,t,r),r};let le=class extends v{render(){return c`
            <div
                class="error-text"
                style="${Oe({display:this.text?"":"none"})}"
            >
                ${this.text}
            </div>
        `}};le.styles=[$`
            .error-text {
                color: var(--error);
                margin-bottom: 0.75rem;
            }
        `];pt([u({type:String})],le.prototype,"text",2);le=pt([d("error-text-element")],le);var Yt=Object.defineProperty,Qt=Object.getOwnPropertyDescriptor,ue=(n,e,t,s)=>{for(var r=s>1?void 0:s?Qt(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Yt(e,t,r),r};let R=class extends v{constructor(){super(...arguments),this.type="text",this.onChange=n=>{const e=n.target;this.value=e.value,this.dispatchEvent(new CustomEvent("change",{detail:this.value}))}}render(){return c`
            <label for="input">${this.label}</label>
            <input id="input" type="${this.type}" placeholder="${this.label}" value="${this.value}" @change="${this.onChange}" />
        `}};R.styles=[$`
            :host {
                display: contents;
            }
            input {
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem;
                line-height: 1.15;
                font-size: 100%;
            }
        `];ue([u({type:String})],R.prototype,"label",2);ue([u({type:String})],R.prototype,"type",2);ue([u()],R.prototype,"value",2);R=ue([d("input-element")],R);var Xt=Object.defineProperty,er=Object.getOwnPropertyDescriptor,ht=(n,e,t,s)=>{for(var r=s>1?void 0:s?er(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Xt(e,t,r),r};let ae=class extends v{constructor(){super(...arguments),this.progress=0}render(){return c`
            <div class="progress-bar" style=${Oe({display:`${this.progress==0?"none":""}`})}>
                <div
                    class="progress-bar-fill"
                    style=${Oe({width:`${this.progress}%`})}
                ></div>
            </div>
        `}};ae.styles=[$`
            .progress-bar {
                grid-column: 1 / -1;
                margin-bottom: 1rem;
            }
            .progress-bar-fill {
                height: 0.25rem;
                background-color: var(--primary-base);
            }
        `];ht([u({type:Number})],ae.prototype,"progress",2);ae=ht([d("progress-bar-element")],ae);var tr=Object.defineProperty,rr=Object.getOwnPropertyDescriptor,ut=(n,e,t,s)=>{for(var r=s>1?void 0:s?rr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&tr(e,t,r),r};let ce=class extends v{render(){return c`<div class="title">${this.title}</div>`}};ce.styles=[$`
            .title {
                font-size: 1.25rem;
                margin-bottom: 0.75rem;
            }
        `];ut([u({type:String})],ce.prototype,"title",2);ce=ut([d("title-element")],ce);var sr=Object.defineProperty,nr=Object.getOwnPropertyDescriptor,dt=(n,e,t,s)=>{for(var r=s>1?void 0:s?nr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&sr(e,t,r),r};let pe=class extends v{constructor(){super(...arguments),this.wifis=[]}onClick(n){this.dispatchEvent(new CustomEvent("networkClick",{detail:n}))}render(){return c`
            <ul>
                ${this.wifis.sort((n,e)=>e.rssi-n.rssi).map(n=>c`
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
        `}};pe.styles=[$`
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                margin-bottom: 0.75rem;
            }
            button-element {
                width: 100%;
            }
        `];dt([u({type:Array})],pe.prototype,"wifis",2);pe=dt([d("wifi-list-element")],pe);var ir=Object.defineProperty,or=Object.getOwnPropertyDescriptor,Re=(n,e,t,s)=>{for(var r=s>1?void 0:s?or(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&ir(e,t,r),r};let K=class extends v{get strength(){const e=(Math.max(-100,Math.min(this.rssi,-30))+100)/70;return Math.floor(e*4)}render(){return c`
            <div class="${E({active:this.strength>=3})}">
                <div class="${E({active:this.strength>=2})}">
                    <div class="${E({active:this.strength>=1})}">
                        <div
                            class="${E({active:this.strength>=0})}"
                        ></div>
                    </div>
                </div>
            </div>
            <span class="${E({hidden:!this.isSecure,lock:!0})}"> 🔒 </span>
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
        `];Re([u({type:Number})],K.prototype,"rssi",2);Re([u({type:Boolean})],K.prototype,"isSecure",2);K=Re([d("wifi-logo-element")],K);var lr=Object.defineProperty,ar=Object.getOwnPropertyDescriptor,cr=(n,e,t,s)=>{for(var r=s>1?void 0:s?ar(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&lr(e,t,r),r};let Ce=class extends v{render(){return c`
            <div class="grid">
                <slot></slot>
            </div>
        `}};Ce.styles=[$`
            .grid {
                display: grid;
                grid-template-columns: min-content auto;
                row-gap: 0.75rem;
                column-gap: 1rem;
                align-items: center;
                margin-bottom: 0.75rem;
            }
        `];Ce=cr([d("input-element-grid")],Ce);class k extends v{back(){this.dispatchEvent(new CustomEvent("back"))}next(){this.dispatchEvent(new CustomEvent("next"))}}var pr=Object.defineProperty,hr=Object.getOwnPropertyDescriptor,ur=(n,e,t,s)=>{for(var r=s>1?void 0:s?hr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&pr(e,t,r),r};let Je=class extends k{render(){return c`
            <title-element
                title="MQTT Configuration (optional)"
            ></title-element>
            <input-element-grid>
                <input-element type="text" label="Server"></input-element>
                <input-element type="number" label="Port"></input-element>
                <input-element type="text" label="User"></input-element>
                <input-element type="password" label="Password"></input-element>
                <input-element type="text" label="Topic"></input-element>
                <input-element type="text" label="Client-ID"></input-element>
            </input-element-grid>
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
        `}};Je=ur([d("mqtt-page")],Je);var Se=(n=>(n[n.IDLE=0]="IDLE",n[n.NO_SSID_AVAIL=1]="NO_SSID_AVAIL",n[n.CONNECTED=3]="CONNECTED",n[n.CONNECT_FAILED=4]="CONNECT_FAILED",n[n.CONNECT_WRONG_PASSWORD=6]="CONNECT_WRONG_PASSWORD",n[n.DISCONNECTED=7]="DISCONNECTED",n[n.ERROR=8]="ERROR",n))(Se||{});async function mt(n,e){return await fetch(n,{method:"POST",body:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})}async function Me(n){return await fetch(n).then(e=>e.json()).catch(e=>(console.error(e),null))}async function dr(n){const e=new URLSearchParams;return e.append("name",n),await mt("/plantName",e)}async function mr(){return await Me("/networks")}async function vr(n,e){const t=new URLSearchParams;return t.append("ssid",n),t.append("password",e),await mt("/connect",t)}async function fr(){const n=await Me("/isConnected");return n==null?8:Number(n)}async function Ye(){return Number(await Me("/update/percentage"))}async function vt(n,e){const t=new FormData;return t.append("upload",n),await fetch(e,{method:"POST",body:t})}async function $r(n){return await vt(n,"/update/littlefs")}async function gr(n){return await vt(n,"/update/firmware")}var yr=Object.defineProperty,_r=Object.getOwnPropertyDescriptor,de=(n,e,t,s)=>{for(var r=s>1?void 0:s?_r(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&yr(e,t,r),r};let G=class extends k{constructor(){super(...arguments),this.errorText=""}async submit(){var t;const n=(t=this.nameElement.value)!=null?t:"";if(n.length<1||n.length>32){this.errorText="Name must be between 1 and 32 characters";return}else this.errorText="";if(!(await dr(n)).ok){this.errorText="Error, device not responding";return}}render(){return c`
            <title-element title="Choose a name for your plant"></title-element>
            <input-element-grid>
                <input-element id="name" label="Plant Name"></input-element>
            </input-element-grid>
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
        `}};de([u({type:String})],G.prototype,"onlineStatus",2);de([Q("#name")],G.prototype,"nameElement",2);de([g()],G.prototype,"errorText",2);G=de([d("name-page")],G);var br=Object.defineProperty,wr=Object.getOwnPropertyDescriptor,T=(n,e,t,s)=>{for(var r=s>1?void 0:s?wr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&br(e,t,r),r};let x=class extends k{constructor(){super(...arguments),this.errorText="",this.littlefsProgress=0,this.firmwareProgress=0}async upload(){if(!this.littlefsElement.value&&!this.firmwareElement.value){this.errorText="Please select a file to upload";return}console.log(this.littlefsElement.value),this.littlefsElement.value&&((async()=>{for(;!this.errorText&&this.littlefsProgress<100;)await Ye().then(e=>{this.littlefsProgress=e}),await new Promise(e=>setTimeout(e,300))})(),(await $r(this.littlefsElement.value)).ok||(this.errorText="Error, device not responding"),this.errorText||(this.littlefsProgress=100)),this.firmwareElement.value&&((async()=>{for(;!this.errorText&&this.firmwareProgress<100;)await Ye().then(e=>{this.firmwareProgress=e}),await new Promise(e=>setTimeout(e,300))})(),(await gr(this.firmwareElement.value)).ok||(this.errorText="Error, device not responding"),this.errorText||(this.firmwareProgress=100))}render(){return c`
            <title-element title="Update Firmware"></title-element>
            <input-element-grid>
                <input-element
                    id="littlefs"
                    label="littlefs.bin"
                    type="file"
                ></input-element>
                <progress-bar-element
                    progress="${this.littlefsProgress}"
                ></progress-bar-element>
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
                <progress-bar-element
                    progress="${this.firmwareProgress}"
                ></progress-bar-element>
            </input-element-grid>
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
        `}};T([u({type:String})],x.prototype,"onlineStatus",2);T([g()],x.prototype,"errorText",2);T([Q("#littlefs")],x.prototype,"littlefsElement",2);T([Q("#firmware")],x.prototype,"firmwareElement",2);T([g()],x.prototype,"littlefsProgress",2);T([g()],x.prototype,"firmwareProgress",2);x=T([d("update-page")],x);var Er=Object.defineProperty,Pr=Object.getOwnPropertyDescriptor,xr=(n,e,t,s)=>{for(var r=s>1?void 0:s?Pr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Er(e,t,r),r};let Qe=class extends k{render(){return c`
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
        `}};Qe=xr([d("welcome-page")],Qe);function Ar(n){return typeof n=="function"?n():n}const ke=class extends Event{constructor(t,s,r){super(ke.eventName,{cancelable:!1});b(this,"key");b(this,"state");b(this,"value");this.key=t,this.value=s,this.state=r}};let N=ke;b(N,"eventName","lit-state-changed");const Or=(n,e)=>e!==n&&(e===e||n===n);class re extends EventTarget{constructor(){super();b(this,"hookMap",new Map);this.constructor.finalize(),this.propertyMap&&[...this.propertyMap].forEach(([t,s])=>{if(s.initialValue!==void 0){const r=Ar(s.initialValue);this[t]=r,s.value=r}})}get propertyMap(){return this.constructor.propertyMap}get stateValue(){return Object.fromEntries([...this.propertyMap].map(([t])=>[t,this[t]]))}static finalize(){if(this.finalized)return!1;this.finalized=!0;const t=Object.keys(this.properties||{});for(const s of t)this.createProperty(s,this.properties[s]);return!0}static createProperty(t,s){this.finalize();const r=typeof t=="symbol"?Symbol():`__${t}`,i=this.getPropertyDescriptor(t,r,s);Object.defineProperty(this.prototype,t,i)}static getPropertyDescriptor(t,s,r){const i=(r==null?void 0:r.hasChanged)||Or;return{get(){return this[s]},set(o){const h=this[t];this[s]=o,i(o,h)===!0&&this.dispatchStateEvent(t,o,this)},configurable:!0,enumerable:!0}}reset(){this.hookMap.forEach(t=>t.reset()),[...this.propertyMap].filter(([t,s])=>!(s.skipReset===!0||s.resetValue===void 0)).forEach(([t,s])=>{this[t]=s.resetValue})}subscribe(t,s,r){s&&!Array.isArray(s)&&(s=[s]);const i=o=>{(!s||s.includes(o.key))&&t(o.key,o.value,this)};return this.addEventListener(N.eventName,i,r),()=>this.removeEventListener(N.eventName,i)}dispatchStateEvent(t,s,r){this.dispatchEvent(new N(t,s,r))}}b(re,"propertyMap"),b(re,"properties"),b(re,"finalized",!1);new URL(window.location.href);class Cr extends re{}const Te=new Cr;var Sr=Object.defineProperty,Tr=Object.getOwnPropertyDescriptor,me=(n,e,t,s)=>{for(var r=s>1?void 0:s?Tr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Sr(e,t,r),r};let Z=class extends k{constructor(){super(),this.errorText="",this.networks=[],this.interval=setInterval(()=>{this.updateNetworks()},5e3),this.updateNetworks(),this.addEventListener("page-destroy",()=>{})}async updateNetworks(){const n=await mr();if(n==null){this.errorText="Error getting networks";return}this.networks=n}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.interval)}onNetworkClick(n){const e=n.detail;Te.network=e,this.next()}render(){return c`
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
        `}};me([u({type:String})],Z.prototype,"onlineStatus",2);me([g()],Z.prototype,"errorText",2);me([g()],Z.prototype,"networks",2);Z=me([d("wifi-scanner-page")],Z);var Dr=Object.defineProperty,Nr=Object.getOwnPropertyDescriptor,ve=(n,e,t,s)=>{for(var r=s>1?void 0:s?Nr(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Dr(e,t,r),r};let J=class extends k{constructor(){super(...arguments),this.errorText=""}async connect(){if(this.errorText="",!(await vr(this.ssidElement.value,this.passwordElement.value)).ok){this.errorText="Error, device not responding";return}for(let e=0;e<10;e++){const t=await fr();if(t==Se.ERROR){this.errorText="Error, device not responding";return}if(t==Se.CONNECTED){this.next();return}await new Promise(s=>setTimeout(s,1e3))}this.errorText="Could not connect to WiFi"}firstUpdated(){var n;((n=Te.network)==null?void 0:n.secure)==7&&this.connect()}render(){var n;return c`
            <title-element title="Enter WiFi Credentials"></title-element>
            <input-element-grid>
                <input-element
                    id="ssid"
                    type="text"
                    label="SSID"
                    value="${(n=Te.network)==null?void 0:n.ssid}"
                ></input-element>
                <input-element
                    id="password"
                    type="password"
                    label="Password"
                ></input-element>
            </input-element-grid>
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
        `}};ve([Q("#ssid")],J.prototype,"ssidElement",2);ve([Q("#password")],J.prototype,"passwordElement",2);ve([g()],J.prototype,"errorText",2);J=ve([d("wifi-setup-page")],J);var jr=Object.defineProperty,Ur=Object.getOwnPropertyDescriptor,L=(n,e,t,s)=>{for(var r=s>1?void 0:s?Ur(e,t):e,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&jr(e,t,r),r};let A=class extends v{constructor(){super(),this.currentDot=0,this.ssid="",this.autoConnect=!1,this.loading=!1,this.pageElements=[],this.onDotClick=t=>{const s=t.detail;this.currentDot=s};const e=new URLSearchParams(window.location.search).get("page");e&&(this.currentDot=parseInt(e)),this.updatePageElements()}next(){this.currentDot=Math.min(this.currentDot+1,this.pageElements.length-1)}back(){this.currentDot=Math.max(this.currentDot-1,0)}updatePageElements(){this.pageElements=[c`<welcome-page @next="${this.next}"></welcome-page>`,c`<update-page
                @next="${this.next}"
                @back="${this.back}"
            ></update-page>`,c`<name-page
                @next="${this.next}"
                @back="${this.back}"
            ></name-page>`,c`<wifi-scanner-page
                @next="${this.next}"
                @back="${this.back}"
            ></wifi-scanner-page>`,c`<wifi-setup-page
                @next="${this.next}"
                @back="${this.back}"
            ></wifi-setup-page>`,c`<mqtt-page
                @next="${this.next}"
                @back="${this.back}"
            ></mqtt-page>`]}updated(){const n=new URLSearchParams(window.location.search);n.set("page",this.currentDot.toString()),window.history.replaceState({},"",`${window.location.pathname}?${n}`)}render(){return c`
            <header-element icon="🌱" title="PlantFi"></header-element>
            <loader-bar-element ?active="${this.loading}"></loader-bar-element>
            <dots-stepper-element
                numberOfDots="${this.pageElements.length}"
                currentDot="${this.currentDot}"
                @dotClicked="${this.onDotClick}"
            ></dots-stepper-element>
            <div class="page">${this.pageElements[this.currentDot]}</div>
        `}};A.styles=$`
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
    `;L([g()],A.prototype,"currentDot",2);L([g()],A.prototype,"ssid",2);L([g()],A.prototype,"autoConnect",2);L([g()],A.prototype,"loading",2);L([g()],A.prototype,"pageElements",2);A=L([d("first-setup-screen")],A);
