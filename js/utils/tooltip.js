// Tooltip utility class and functions

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { COLORS } from '../config/constants.js';
import { camelToDash, dashToCamel } from './utils.js';

export class TooltipManager {
    /**
     * @param {string} className - Classe CSS del tooltip
     * @param {Object} styles - Stili personalizzati (opzionale)
     */

    constructor(className = 'tooltip', styles = {}) {
        this.className = className;
        this.tooltip = null;
        this.styles = {
            position: 'absolute',
            pointerEvents: 'none',
            background: COLORS.white,
            border: `1px solid ${COLORS.warmerGray}`,
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            fontSize: '12px',
            opacity: 0,
            zIndex: 1000,
            ...styles
        };
    }

    /**
     * Crea il tooltip nel DOM
     * @returns {TooltipManager} this per chaining
     */
    create() {
        d3.select('body').selectAll(`.${this.className}`).remove();

        this.tooltip = d3.select("body")
                            .append("div")
                            .attr("class", this.className);

        // Apply styles
        Object.entries(this.styles).forEach(([key, value]) => {
            const cssKey = camelToDash(key);
            this.tooltip.style(cssKey, value);
        });

        return this;
    }

    /**
     * Posiziona il tooltip rispetto al cursore con viewport clamping
     * @param {MouseEvent} event - Evento mouse
     * @param {number} offsetX - Offset orizzontale dal cursore
     * @param {number} offsetY - Offset verticale dal cursore
     * @returns {TooltipManager} this per chaining
     */
    position(event, offsetX = 12, offsetY = 12) {

        if (!this.tooltip) {
            console.warn('Tooltip not created. Call create() first.');
            return this;
        }

        // Getting the first DOM node of the tooltip selection
        const node = this.tooltip.node();
        
        // Safety check
        if (!node) return this;

        // Global mouse position
        const pageX = event.pageX;
        const pageY = event.pageY;
        
        // Initial position to the right/below the cursor
        let left = pageX + offsetX;
        let top = pageY + offsetY;

        // Measure tooltip size and viewport scroll
        const rect = node.getBoundingClientRect();
        const tw = rect.width;
        const th = rect.height;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;

        // Adjust horizontal position if overflowing
        if (left + tw > vw + scrollX - 8) {
            left = pageX - tw - offsetX;
        }

        // Adjust vertical position if overflowing
        if (top + th > vh + scrollY - 8) {
            top = pageY - th - offsetY;
        }

        // Ensure tooltip is not off-screen
        left = Math.max(scrollX + 8, left);
        top = Math.max(scrollY + 8, top);

        this.tooltip
            .style("left", left + "px")
            .style("top", top + "px");
        
        return this;
    }

    /**
     * Mostra il tooltip con contenuto HTML
     * @param {string} html - Contenuto HTML da mostrare
     * @param {number} duration - Durata fade-in (ms)
     * @returns {TooltipManager} this per chaining
     */
    show(html, duration = 200) {
        if (!this.tooltip) {
            console.warn('Tooltip not created. Call create() first.');
            return this;
        }

        this.tooltip
            .html(html)
            //.transition()
            //.duration(duration)
            .style('opacity', 1);

        return this;
    }

    /**
     * Nasconde il tooltip
     * @param {number} duration - Durata fade-out (ms)
     * @returns {TooltipManager} this per chaining
     */
    hide(duration = 150) {
        if (!this.tooltip) return this;

        this.tooltip
            //.transition()
            //.duration(duration)
            .style('opacity', 0);

        return this;
    }

    /**
     * Imposta stili custom sul tooltip
     * @param {Object} styles - Oggetto con proprietà CSS
     * @returns {TooltipManager} this per chaining
     */
    setStyles(styles) {
        if (!this.tooltip) return this;

        Object.entries(styles).forEach(([key, value]) => {
            const cssKey = camelToDash(key);
            this.tooltip.style(cssKey, value);
        });

        return this;
    }

    /**
     * Aggiunge una classe CSS al tooltip
     * @param {string} className - Classe da aggiungere
     * @returns {TooltipManager} this per chaining
     */
    addClass(className) {
        if (!this.tooltip) return this;
        this.tooltip.classed(className, true);
        return this;
    }

    /**
     * Rimuove il tooltip dal DOM
     * @returns {TooltipManager} this per chaining
     */
    destroy() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        return this;
    }

    /**
     * Verifica se il tooltip è attualmente visibile
     * @returns {boolean}
     */
    isVisible() {
        if (!this.tooltip) return false;
        return parseFloat(this.tooltip.style('opacity')) > 0;
    }

    /**
     * Helper per creare handlers standard mouseover/mousemove/mouseout
     * @param {Function} contentFn - Funzione che genera l'HTML del tooltip
     * @returns {Object} Oggetto con handlers {onMouseOver, onMouseMove, onMouseOut}
     */
    createHandlers(contentFn) {
        return {
            onMouseOver: (event, d) => {
                this.show(contentFn(d, event));
            },
            onMouseMove: (event) => {
                this.position(event);
            },
            onMouseOut: () => {
                this.hide();
            }
        };
    }
}
