const clock_subscribe = (()=>{
    class TimeTarget extends EventTarget{
        customAddEventListener:(type: string, listener: EventListener | EventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined) => void;
        customRemoveEventListener:(type: string, callback: EventListener | EventListenerObject | null, options?: boolean | EventListenerOptions | undefined) => void;
        length:number;
        interval_id:NodeJS.Timeout|undefined;

        constructor(){
            super();
            this.customAddEventListener = (...a)=>{
                this.addEventListener(...a);
                if(this.length===0){
                    this.timeLoop(1000);
                }
                this.length++;
            };
            this.customRemoveEventListener = (...a)=>{
                this.removeEventListener(...a);
                this.length--;
                if(this.length===0){
                    if (this.interval_id!==undefined){
                        clearInterval(this.interval_id);
                    }
                }
            };
            this.length=0;
        }

        timeLoop(loop_ms:number,input_overshoot:number=0){
            const ms=new Date().getTime();

            const next_time=parseInt(''+((ms%loop_ms)+(loop_ms-input_overshoot)));
            this.interval_id=setTimeout(()=>{
                const overshoot = new Date().getTime()%loop_ms;
                event_target.dispatchEvent(new Event("TIME_CHANGE"));
                if(!Number.isNaN(next_time)){
                    this.timeLoop(loop_ms,overshoot)
                }else{
                    throw new Error("NaN found "+JSON.stringify({ms,loop_ms,input_overshoot}));
                }
            },next_time);
        }
    }

    const event_target = new TimeTarget();

    return function(cb:()=>any){
        event_target.customAddEventListener("TIME_CHANGE",cb);
        return ()=>{event_target.customRemoveEventListener("TIME_CHANGE",cb)};
    }
})();
