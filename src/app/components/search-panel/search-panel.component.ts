import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListingMode, PropertyType } from '../../models/listing';
import { SelectOption } from '../../models/filter';

@Component({
  selector: 'app-search-panel',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="search-section" aria-label="Recherche immobiliere">
      <div class="search-panel">
        <div class="search-topline">
          <div class="mode-switch" role="group" aria-label="Type de transaction">
            @for (mode of modes; track mode.value) {
              <button type="button" [class.active]="selectedMode === mode.value" (click)="modeChange.emit(mode.value)">{{ mode.label }}</button>
            }
          </div>
          <label class="search-field"><span>Ville, quartier ou mot-cle</span>
            <input type="search" placeholder="Ex: Anfa, terrasse, vue mer..." [ngModel]="query" (ngModelChange)="queryChange.emit($event)" />
          </label>
        </div>
        <div class="search-bottomline">
          <div class="quick-filters">
            <label><span>Ville</span><select [ngModel]="selectedCity" (ngModelChange)="cityChange.emit($event)">@for (city of cities; track city) { <option [value]="city">{{ city }}</option> }</select></label>
            <label><span>Type</span><select [ngModel]="selectedType" (ngModelChange)="typeChange.emit($event)"><option value="Tous">Tous</option>@for (type of propertyTypes; track type) { <option [value]="type">{{ type }}</option> }</select></label>
            <label><span>Pieces min.</span><select [ngModel]="minRooms" (ngModelChange)="roomsChange.emit(+$event)">@for (room of [1, 2, 3, 4, 5]; track room) { <option [value]="room">{{ room }}+</option> }</select></label>
          </div>
          <a class="search-button" href="#annonces">Rechercher</a>
        </div>
      </div>
    </section>
  `,
})
export class SearchPanelComponent {
  @Input({ required: true }) modes!: SelectOption<ListingMode>[];
  @Input({ required: true }) cities!: string[];
  @Input({ required: true }) propertyTypes!: PropertyType[];
  @Input({ required: true }) selectedMode!: ListingMode;
  @Input({ required: true }) selectedCity!: string;
  @Input({ required: true }) selectedType!: PropertyType | 'Tous';
  @Input({ required: true }) minRooms!: number;
  @Input() query = '';
  @Output() readonly modeChange = new EventEmitter<ListingMode>();
  @Output() readonly cityChange = new EventEmitter<string>();
  @Output() readonly typeChange = new EventEmitter<PropertyType | 'Tous'>();
  @Output() readonly roomsChange = new EventEmitter<number>();
  @Output() readonly queryChange = new EventEmitter<string>();
}
