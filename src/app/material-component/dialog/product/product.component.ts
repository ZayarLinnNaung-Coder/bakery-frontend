import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  onAddProduct = new EventEmitter();
  onEditProduct = new EventEmitter();
  productForm:any = FormGroup;
  dialogAction:any = "Add";
  action:any = "Add";
  responseMessage:any;
  categorys:any = [];

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData:any,
  private formBuilder: FormBuilder,
  private productService: ProductService,
  public dialogRef: MatDialogRef<ProductComponent>,
  private categoryService: CategoryService,
  private snackbarService: SnackbarService) { }

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile!: File;
  fileUploadUrl!: string;

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      name:[null,[Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      categoryId:[null, [Validators.required]],
      price: [null, [Validators.required]],
      flavor: [null, Validators.required]
    });

    if(this.dialogData.action === "Edit"){
      this.dialogAction = "Edit";
      this.action = "Update";
      this.productForm.patchValue(this.dialogData.data);
      this.fileUploadUrl = this.dialogData.data.imagePath
    }
    this.getCategorys();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreview = reader.result; // Convert image to Base64 URL

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        this.productService.uploadImage(formData).subscribe((response: any) => {
          this.fileUploadUrl = response.path;
        });

      };

      reader.readAsDataURL(this.selectedFile); // Read the file as Data URL
    }
  }

  getCategorys(){
    this.categoryService.getCategorys().subscribe((response:any)=>{
      this.categorys = response;
    }, (error:any)=>{
      console.log(error);
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  handleSubmit(){
    if(this.dialogAction === "Edit"){
      this.edit();
    }
    else{
      this.add();
    }
  }

  add(){
    var formData = this.productForm.value;
    var data = {
      imagePath: this.fileUploadUrl,
      name: formData.name,
      categoryId: formData.categoryId,
      price: formData.price,
      flavor: formData.flavor
    }

    this.productService.add(data).subscribe((response:any)=>{
      this.dialogRef.close();
      this.onAddProduct.emit();
      this.responseMessage = response.message;
      this.snackbarService.openSnackBar(this.responseMessage, "success");
    }, (error)=>{
      console.log(error);
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  edit(){
    var formData = this.productForm.value;
    var data = {
      id: this.dialogData.data.id,
      imagePath: this.fileUploadUrl,
      name: formData.name,
      categoryId: formData.categoryId,
      price: formData.price,
      flavor: formData.flavor
    }

    this.productService.update(data).subscribe((response:any)=>{
      this.dialogRef.close();
      this.onEditProduct.emit();
      this.responseMessage = response.message;
      this.snackbarService.openSnackBar(this.responseMessage, "success");
    }, (error)=>{
      console.log(error);
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

}
