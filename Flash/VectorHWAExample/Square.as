package
{
	import flash.display.LineScaleMode;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.geom.Matrix;

	public class Square extends Sprite
	{
		public function Square()
		{
			draw();
			cacheAsBitmap = true;
			cacheAsBitmapMatrix = new Matrix();
			addEventListener(Event.ENTER_FRAME, onEnterFrame);
		}
		
		private function draw():void
		{
			graphics.lineStyle(1, 0x000000);
			graphics.beginFill(0x000000, .25);
			graphics.drawRect(0,0, 25, 10);
			graphics.drawRect(0,0, 10, 25);
			graphics.endFill();
		}
		
		private function onEnterFrame(e:Event):void
		{
			rotation += 10;
		}
	}
}